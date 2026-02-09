import Assets from '../../../shared/assets.js';

export default class TileMapRenderer {
    constructor(mapData, viewportWidth, viewportHeight) {
        this.mapData = mapData;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        this.FLASH_HEIGHT = 480;
        this.FLASH_Y_BASE = 425;
        this.FLASH_Y_OFFSET = 36;

        this.scaleY = viewportHeight / this.FLASH_HEIGHT;

        this.visibleTiles = [];

        this.loadedAssets = new Map();

        this.BUFFER_ZONE = 100;

        this.lastCameraX = 0;
        this.lastCameraY = 0;

        this.tileDimensions = new Map();

        this._mergeVisualLayers();

        this._convertCoordinates();

        this._buildSpatialIndex();
    }

    _mergeVisualLayers() {
        this.allTiles = [];

        if (this.mapData.visualInfo && Array.isArray(this.mapData.visualInfo)) {
            this.mapData.visualInfo.forEach((tile, index) => {
                if (tile.imageId || tile.animId) {
                    this.allTiles.push({
                        ...tile,
                        layer: 'back',
                        originalIndex: index
                    });
                }
            });
        }

        if (this.mapData.frontVisualInfo && Array.isArray(this.mapData.frontVisualInfo)) {
            this.mapData.frontVisualInfo.forEach((tile, index) => {
                if (tile.imageId || tile.animId) {
                    this.allTiles.push({
                        ...tile,
                        layer: 'front',
                        originalIndex: index
                    });
                }
            });
        }

        this.allTiles.sort((a, b) => (a.depth || 0) - (b.depth || 0));
    }

    _convertCoordinates() {
        let minY = Infinity, maxY = -Infinity;

        const GROUND_LEVEL = 425;
        const SCALE_FACTOR = 0.641509;
        const Y_OFFSET = 36;

        this.allTiles.forEach(tileInfo => {
            if (!tileInfo.imageId && !tileInfo.animId) return;

            tileInfo.convertedX = tileInfo.posX * SCALE_FACTOR;

            const flashY = GROUND_LEVEL - (tileInfo.posY * SCALE_FACTOR) + Y_OFFSET;

            tileInfo.convertedY = flashY * this.scaleY;

            const PS2_Y_OFFSET = this.viewportHeight === 448 ? 30 : 0;
            tileInfo.convertedY += PS2_Y_OFFSET;

            minY = Math.min(minY, tileInfo.convertedY);
            maxY = Math.max(maxY, tileInfo.convertedY);
        });
    }

    _buildSpatialIndex() {
        const CELL_SIZE = 256;
        this.spatialGrid = new Map();

        this.allTiles.forEach((tileInfo, index) => {
            if (!tileInfo.imageId && !tileInfo.animId) return;

            const cellX = Math.floor(tileInfo.convertedX / CELL_SIZE);
            const cellY = Math.floor(tileInfo.convertedY / CELL_SIZE);
            const cellKey = `${cellX},${cellY}`;

            if (!this.spatialGrid.has(cellKey)) {
                this.spatialGrid.set(cellKey, []);
            }

            this.spatialGrid.get(cellKey).push(index);
        });
    }

    _getPotentiallyVisibleTiles(minX, maxX, minY, maxY) {
        const CELL_SIZE = 256;
        const potentialTiles = [];
        const seenIndices = new Set();

        const startCellX = Math.floor(minX / CELL_SIZE);
        const endCellX = Math.floor(maxX / CELL_SIZE);
        const startCellY = Math.floor(minY / CELL_SIZE);
        const endCellY = Math.floor(maxY / CELL_SIZE);

        for (let cx = startCellX; cx <= endCellX; cx++) {
            for (let cy = startCellY; cy <= endCellY; cy++) {
                const cellKey = `${cx},${cy}`;
                const cellTiles = this.spatialGrid.get(cellKey);

                if (cellTiles) {
                    cellTiles.forEach(index => {
                        if (!seenIndices.has(index)) {
                            seenIndices.add(index);
                            potentialTiles.push(this.allTiles[index]);
                        }
                    });
                }
            }
        }

        return potentialTiles;
    }

    update(cameraX, cameraY) {
        const minX = cameraX - this.BUFFER_ZONE;
        const maxX = cameraX + this.viewportWidth + this.BUFFER_ZONE;
        const minY = cameraY - this.BUFFER_ZONE;
        const maxY = cameraY + this.viewportHeight + this.BUFFER_ZONE;

        const stillVisible = new Set();
        const newVisibleTiles = [];

        const potentialTiles = this._getPotentiallyVisibleTiles(minX, maxX, minY, maxY);

        potentialTiles.forEach(tileInfo => {
            if (!tileInfo.imageId) return;

            const imagePath = this._getImagePath(tileInfo.imageId || tileInfo.animId);

            let tileDim = this.tileDimensions.get(tileInfo.imageId || tileInfo.animId);

            if (!tileDim) {
                const asset = Assets.image(imagePath);
                tileDim = {
                    width: asset.width || 64,
                    height: asset.height || 64
                };
                this.tileDimensions.set(tileInfo.imageId || tileInfo.animId, tileDim);
            }

            const isVisible = (
                tileInfo.convertedX + tileDim.width > minX &&
                tileInfo.convertedX < maxX &&
                tileInfo.convertedY + tileDim.height > minY &&
                tileInfo.convertedY < maxY
            );

            if (isVisible) {
                stillVisible.add(imagePath);

                if (!this.loadedAssets.has(imagePath)) {
                    const asset = Assets.image(imagePath);
                    this.loadedAssets.set(imagePath, {
                        refCount: 0,
                        width: asset.width,
                        height: asset.height
                    });
                }

                this.loadedAssets.get(imagePath).refCount++;

                newVisibleTiles.push({
                    imageId: tileInfo.imageId || tileInfo.animId,
                    imagePath: imagePath,
                    posX: tileInfo.convertedX,
                    posY: tileInfo.convertedY,
                    depth: tileInfo.depth || 0,
                    layer: tileInfo.layer
                });
            }
        });

        this.loadedAssets.forEach((info, path) => {
            if (!stillVisible.has(path)) {
                Assets.free(path);
                this.loadedAssets.delete(path);
            } else {
                info.refCount = 0;
            }
        });

        newVisibleTiles.sort((a, b) => (a.depth || 0) - (b.depth || 0));

        this.visibleTiles = newVisibleTiles;
        this.lastCameraX = cameraX;
        this.lastCameraY = cameraY;
    }

    render(cameraX, cameraY) {
        for (let i = this.visibleTiles.length - 1; i >= 0; i--) {
            const tile = this.visibleTiles[i];
            const asset = Assets.image(tile.imagePath);

            if (asset && asset.ready && asset.ready()) {
                const screenX = tile.posX - cameraX;
                const screenY = tile.posY - cameraY;

                asset.draw(screenX, screenY);
            }
        }
    }

    _getImagePath(imageId) {
        return `assets/img/tiles/${imageId}.png`;
    }

    getStats() {
        const backCount = this.allTiles.filter(t => t.layer === 'back').length;
        const frontCount = this.allTiles.filter(t => t.layer === 'front').length;

        return {
            visibleTiles: this.visibleTiles.length,
            visibleBack: this.visibleTiles.filter(t => t.layer === 'back').length,
            visibleFront: this.visibleTiles.filter(t => t.layer === 'front').length,
            loadedAssets: this.loadedAssets.size,
            totalTilesBack: backCount,
            totalTilesFront: frontCount,
            totalTiles: this.allTiles.length,
            cachedDimensions: this.tileDimensions.size,
            spatialCells: this.spatialGrid.size,
            scaleY: this.scaleY,
            depthRange: this.allTiles.length > 0 ? {
                min: this.allTiles[this.allTiles.length - 1].depth,
                max: this.allTiles[0].depth
            } : null
        };
    }

    free() {
        this.loadedAssets.forEach((info, path) => {
            Assets.free(path);
        });

        this.visibleTiles = [];
        this.allTiles = [];
        this.loadedAssets.clear();
        this.tileDimensions.clear();
        this.spatialGrid.clear();
    }
}