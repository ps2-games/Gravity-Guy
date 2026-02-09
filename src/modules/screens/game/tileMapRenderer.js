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

        this.lastCameraX = -999999;
        this.lastCameraY = -999999;
        
        this.tileDimensions = new Map();
        this._pathCache = new Map();

        this._mergeVisualLayers();
        this._convertCoordinates();
        this._buildSpatialIndex();
    }

    _mergeVisualLayers() {
        this.allTiles = [];
        
        if (this.mapData.visualInfo && Array.isArray(this.mapData.visualInfo)) {
            for (let i = 0; i < this.mapData.visualInfo.length; i++) {
                const tile = this.mapData.visualInfo[i];
                if (tile.imageId || tile.animId) {
                    this.allTiles.push({
                        id: tile.imageId || tile.animId,
                        posX: tile.posX,
                        posY: tile.posY,
                        depth: tile.depth || 0,
                        layer: 'back',
                        originalIndex: i
                    });
                }
            }
        }

        if (this.mapData.frontVisualInfo && Array.isArray(this.mapData.frontVisualInfo)) {
            for (let i = 0; i < this.mapData.frontVisualInfo.length; i++) {
                const tile = this.mapData.frontVisualInfo[i];
                if (tile.imageId || tile.animId) {
                    this.allTiles.push({
                        id: tile.imageId || tile.animId,
                        posX: tile.posX,
                        posY: tile.posY,
                        depth: tile.depth || 0,
                        layer: 'front',
                        originalIndex: i
                    });
                }
            }
        }

        this.allTiles.sort((a, b) => (a.depth || 0) - (b.depth || 0));
    }

    _convertCoordinates() {
        const GROUND_LEVEL = 425;
        const SCALE_FACTOR = 0.641509f;
        const Y_OFFSET = 36;
        const PS2_Y_OFFSET = this.viewportHeight === 448 ? 30 : 0;

        for (let i = 0; i < this.allTiles.length; i++) {
            const tile = this.allTiles[i];
            
            tile.convertedX = tile.posX * SCALE_FACTOR;
            const flashY = GROUND_LEVEL - (tile.posY * SCALE_FACTOR) + Y_OFFSET;
            tile.convertedY = (flashY * this.scaleY) + PS2_Y_OFFSET;
            
            delete tile.posX;
            delete tile.posY;
        }
    }

    _buildSpatialIndex() {
        const CELL_SIZE = 256;
        this.spatialGrid = new Map();

        for (let i = 0; i < this.allTiles.length; i++) {
            const tile = this.allTiles[i];
            const cellX = Math.floor(tile.convertedX / CELL_SIZE);
            const cellY = Math.floor(tile.convertedY / CELL_SIZE);
            const cellKey = `${cellX},${cellY}`;

            if (!this.spatialGrid.has(cellKey)) {
                this.spatialGrid.set(cellKey, []);
            }
            this.spatialGrid.get(cellKey).push(i);
        }
    }

    _getImagePath(imageId) {
        let path = this._pathCache.get(imageId);
        if (!path) {
            path = `assets/img/tiles/${imageId}.png`;
            this._pathCache.set(imageId, path);
        }
        return path;
    }

    update(cameraX, cameraY) {
        const camDeltaX = Math.abs(cameraX - this.lastCameraX);
        const camDeltaY = Math.abs(cameraY - this.lastCameraY);
        
        if (camDeltaX < 1 && camDeltaY < 1) {
            return;
        }

        this.lastCameraX = cameraX;
        this.lastCameraY = cameraY;

        const minX = cameraX - this.BUFFER_ZONE;
        const maxX = cameraX + this.viewportWidth + this.BUFFER_ZONE;
        const minY = cameraY - this.BUFFER_ZONE;
        const maxY = cameraY + this.viewportHeight + this.BUFFER_ZONE;

        const CELL_SIZE = 256;
        const startCellX = Math.floor(minX / CELL_SIZE);
        const endCellX = Math.floor(maxX / CELL_SIZE);
        const startCellY = Math.floor(minY / CELL_SIZE);
        const endCellY = Math.floor(maxY / CELL_SIZE);

        const newVisibleTiles = [];
        const seenIndices = new Set();
        const requiredAssets = new Set();

        for (let cx = startCellX; cx <= endCellX; cx++) {
            for (let cy = startCellY; cy <= endCellY; cy++) {
                const cellKey = `${cx},${cy}`;
                const indices = this.spatialGrid.get(cellKey);
                
                if (!indices) continue;

                for (let i = 0; i < indices.length; i++) {
                    const tileIdx = indices[i];
                    
                    if (seenIndices.has(tileIdx)) continue;
                    seenIndices.add(tileIdx);

                    const tileInfo = this.allTiles[tileIdx];
                    const imageId = tileInfo.id;
                    
                    let dim = this.tileDimensions.get(imageId);
                    let imagePath;
                    
                    if (!dim) {
                        imagePath = this._getImagePath(imageId);
                        const asset = Assets.image(imagePath);
                        dim = { 
                            width: asset.width || 64, 
                            height: asset.height || 64 
                        };
                        this.tileDimensions.set(imageId, dim);
                        tileInfo._cachedPath = imagePath;
                    } else {
                        imagePath = tileInfo._cachedPath || this._getImagePath(imageId);
                    }

                    if (tileInfo.convertedX + dim.width <= minX || 
                        tileInfo.convertedX >= maxX ||
                        tileInfo.convertedY + dim.height <= minY || 
                        tileInfo.convertedY >= maxY) {
                        continue;
                    }

                    requiredAssets.add(imagePath);

                    newVisibleTiles.push({
                        imageId: imageId,
                        imagePath: imagePath,
                        posX: tileInfo.convertedX,
                        posY: tileInfo.convertedY,
                        depth: tileInfo.depth || 0,
                        layer: tileInfo.layer
                    });
                }
            }
        }

        this.loadedAssets.forEach((info, path) => {
            if (!requiredAssets.has(path)) {
                Assets.free(path);
            }
        });

        requiredAssets.forEach(path => {
            if (!this.loadedAssets.has(path)) {
                const asset = Assets.image(path);
                this.loadedAssets.set(path, {
                    loaded: true,
                    width: asset.width,
                    height: asset.height
                });
            }
        });

        const newLoadedAssets = new Map();
        requiredAssets.forEach(path => {
            if (this.loadedAssets.has(path)) {
                newLoadedAssets.set(path, this.loadedAssets.get(path));
            }
        });
        this.loadedAssets = newLoadedAssets;

        newVisibleTiles.sort((a, b) => (a.depth || 0) - (b.depth || 0));
        this.visibleTiles = newVisibleTiles;
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
            scaleY: this.scaleY
        };
    }

    free() {
        this.loadedAssets.forEach((_, path) => Assets.free(path));
        this.visibleTiles = [];
        this.allTiles = [];
        this.loadedAssets.clear();
        this.tileDimensions.clear();
        this.spatialGrid.clear();
        this._pathCache.clear();
    }
}