import Assets from '../../../shared/assets.js';

export default class TileMapRenderer {
    constructor(mapData, viewportWidth, viewportHeight) {
        this.mapData = mapData;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        this.FLASH_HEIGHT = 480;
        this.scaleY = viewportHeight / this.FLASH_HEIGHT;
        this.visibleTiles = [];
        this.loadedAssets = new Map();
        this.BUFFER_ZONE = 100;

        this.lastCameraX = -999999;
        this.lastCameraY = -999999;
        
        this.tileDimensions = new Map();
        this._pathCache = new Map();
        
        this._lastVisitedCells = new Set();
        this._currentVisitedCells = new Set();
        
        this.UPDATE_THRESHOLD = 8;

        this._mergeVisualLayers();
        this._convertCoordinates();
        this._buildSpatialIndex();
        this._preloadAllAssets();
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
        this.CELL_SIZE = CELL_SIZE;
        this.spatialGrid = new Map();

        for (let i = 0; i < this.allTiles.length; i++) {
            const tile = this.allTiles[i];
            
            const imageId = tile.id;
            const imagePath = `assets/img/tiles/${imageId}.png`;
            tile._cachedPath = imagePath;
            this._pathCache.set(imageId, imagePath);
            
            const asset = Assets.image(imagePath);
            const width = asset.width || 64;
            const height = asset.height || 64;
            
            tile._width = width;
            tile._height = height;
            tile._right = tile.convertedX + width;
            tile._bottom = tile.convertedY + height;
            
            this.tileDimensions.set(imageId, { width, height });
            
            const startCellX = Math.floor(tile.convertedX / CELL_SIZE);
            const endCellX = Math.floor(tile._right / CELL_SIZE);
            const startCellY = Math.floor(tile.convertedY / CELL_SIZE);
            const endCellY = Math.floor(tile._bottom / CELL_SIZE);
            
            for (let cx = startCellX; cx <= endCellX; cx++) {
                for (let cy = startCellY; cy <= endCellY; cy++) {
                    const cellKey = `${cx},${cy}`;
                    if (!this.spatialGrid.has(cellKey)) {
                        this.spatialGrid.set(cellKey, []);
                    }
                    this.spatialGrid.get(cellKey).push(i);
                }
            }
        }
    }

    _preloadAllAssets() {
        const uniquePaths = new Set();
        for (let i = 0; i < this.allTiles.length; i++) {
            uniquePaths.add(this.allTiles[i]._cachedPath);
        }

        uniquePaths.forEach(path => {
            const asset = Assets.image(path);
            this.loadedAssets.set(path, {
                loaded: true,
                width: asset.width || 64,
                height: asset.height || 64
            });
        });
    }

    update(cameraX, cameraY) {
        const camDeltaX = Math.abs(cameraX - this.lastCameraX);
        const camDeltaY = Math.abs(cameraY - this.lastCameraY);
        
        if (camDeltaX < this.UPDATE_THRESHOLD && camDeltaY < this.UPDATE_THRESHOLD) {
            return;
        }

        this.lastCameraX = cameraX;
        this.lastCameraY = cameraY;

        const minX = cameraX - this.BUFFER_ZONE;
        const maxX = cameraX + this.viewportWidth + this.BUFFER_ZONE;
        const minY = cameraY - this.BUFFER_ZONE;
        const maxY = cameraY + this.viewportHeight + this.BUFFER_ZONE;

        const startCellX = Math.floor(minX / this.CELL_SIZE);
        const endCellX = Math.floor(maxX / this.CELL_SIZE);
        const startCellY = Math.floor(minY / this.CELL_SIZE);
        const endCellY = Math.floor(maxY / this.CELL_SIZE);

        let visibleCount = 0;
        this._currentVisitedCells.clear();

        for (let cx = startCellX; cx <= endCellX; cx++) {
            for (let cy = startCellY; cy <= endCellY; cy++) {
                const cellKey = `${cx},${cy}`;
                this._currentVisitedCells.add(cellKey);
                
                const indices = this.spatialGrid.get(cellKey);
                if (!indices) continue;

                const len = indices.length;
                for (let i = 0; i < len; i++) {
                    const tileInfo = this.allTiles[indices[i]];
                    
                    if (tileInfo._right <= minX || tileInfo.convertedX >= maxX ||
                        tileInfo._bottom <= minY || tileInfo.convertedY >= maxY) {
                        continue;
                    }

                    if (visibleCount < this.visibleTiles.length) {
                        const tile = this.visibleTiles[visibleCount];
                        tile.imageId = tileInfo.id;
                        tile.imagePath = tileInfo._cachedPath;
                        tile.posX = tileInfo.convertedX;
                        tile.posY = tileInfo.convertedY;
                        tile.depth = tileInfo.depth;
                        tile.layer = tileInfo.layer;
                    } else {
                        this.visibleTiles.push({
                            imageId: tileInfo.id,
                            imagePath: tileInfo._cachedPath,
                            posX: tileInfo.convertedX,
                            posY: tileInfo.convertedY,
                            depth: tileInfo.depth,
                            layer: tileInfo.layer
                        });
                    }
                    visibleCount++;
                }
            }
        }

        this.visibleTiles.length = visibleCount;

        const temp = this._lastVisitedCells;
        this._lastVisitedCells = this._currentVisitedCells;
        this._currentVisitedCells = temp;
    }

    render(cameraX, cameraY) {
        const tiles = this.visibleTiles;
        const len = tiles.length;
        
        for (let i = 0; i < len; i++) {
            const tile = tiles[i];
            const asset = Assets.image(tile.imagePath);

            const screenX = tile.posX - cameraX;
            const screenY = tile.posY - cameraY;
            asset.draw(screenX, screenY);
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
            scaleY: this.scaleY,
            updateThreshold: this.UPDATE_THRESHOLD
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
        this._lastVisitedCells.clear();
        this._currentVisitedCells.clear();
    }
}