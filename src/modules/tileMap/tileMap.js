import { ASSETS_PATH, SCREEN_HEIGHT, SCREEN_WIDTH } from "../../shared/constants.js";

export default class TileMapRenderer {
    constructor(mapDataArray) {
        this.FLASH_HEIGHT = 480;
        this.scaleY = SCREEN_HEIGHT / this.FLASH_HEIGHT;
        this.cameraX = 0;
        this.cameraY = 0;
        
        this.tileConfigs = [
            JSON.parse(std.loadFile(ASSETS_PATH.TEXTURES + "/texture-0.json")),
            JSON.parse(std.loadFile(ASSETS_PATH.TEXTURES + "/texture-1.json")),
            JSON.parse(std.loadFile(ASSETS_PATH.TEXTURES + "/texture-2.json")),
        ];

        this.SPRITE_SHEETS = [
            ASSETS_PATH.TEXTURES + "/texture-0.png",
            ASSETS_PATH.TEXTURES + "/texture-1.png",
            ASSETS_PATH.TEXTURES + "/texture-2.png",
        ];

        this.layers = this._processMapData(mapDataArray);
        this.descriptor = this._createDescriptor();
        this.instances = this._createInstances();
    }

    _processMapData(mapDataArray) {
        const allVisuals = [];
        let totalBackgroundCount = 0;
        let totalForegroundCount = 0;

        for (let i = 0; i < mapDataArray.length; i++) {
            const mapData = mapDataArray[i];

            if (mapData.visualInfo) {
                const bgVisuals = mapData.visualInfo.map(v => {
                    const imageId = v.imageId || v.animId;
                    const finalImageId = imageId.endsWith('.png') ? imageId : imageId + '.png';

                    return {
                        ...v,
                        layerType: 'background',
                        imageId: finalImageId
                    };
                });

                allVisuals.push(...bgVisuals);
                totalBackgroundCount += bgVisuals.length;
            }

            if (mapData.frontVisualInfo) {
                const fgVisuals = mapData.frontVisualInfo.map(v => {
                    const imageId = v.imageId || v.animId;
                    const finalImageId = imageId.endsWith('.png') ? imageId : imageId + '.png';

                    return {
                        ...v,
                        layerType: 'foreground',
                        imageId: finalImageId
                    };
                });
                allVisuals.push(...fgVisuals);
                totalForegroundCount += fgVisuals.length;
            }
        }

        allVisuals.sort((a, b) => a.depth - b.depth);

        const layers = {
            background: allVisuals.filter(v => v.layerType === 'background'),
            foreground: allVisuals.filter(v => v.layerType === 'foreground')
        };

        return layers;
    }

    _createDescriptor() {
        const framesCounts = this.tileConfigs.map(cfg => cfg.frames.length);

        let acc = 0;
        const offsets = framesCounts.map(count => (acc += count) - 1);

        const descriptor = new TileMap.Descriptor({
            textures: this.SPRITE_SHEETS,
            materials: [
                {
                    texture_index: 0,
                    blend_mode: Screen.alphaEquation(
                        Screen.ZERO_RGB,
                        Screen.SRC_RGB,
                        Screen.SRC_ALPHA,
                        Screen.DST_RGB,
                        0
                    ),
                    end_offset: offsets[0]
                },
                {
                    texture_index: 1,
                    blend_mode: Screen.alphaEquation(
                        Screen.ZERO_RGB,
                        Screen.SRC_RGB,
                        Screen.SRC_ALPHA,
                        Screen.DST_RGB,
                        0
                    ),
                    end_offset: offsets[1]
                },
                {
                    texture_index: 2,
                    blend_mode: Screen.alphaEquation(
                        Screen.ZERO_RGB,
                        Screen.SRC_RGB,
                        Screen.SRC_ALPHA,
                        Screen.DST_RGB,
                        0
                    ),
                    end_offset: offsets[2]
                }
            ]
        });

        return descriptor;
    }

    _createSpriteData(visualInfo) {
        const GROUND_LEVEL = 425;
        const SCALE_FACTOR = 0.641509;
        const Y_OFFSET = 36;
        const PS2_Y_OFFSET = SCREEN_HEIGHT === 448 ? 30 : 0;

        let successCount = 0;
        let failCount = 0;
        const failedTiles = [];

        const sprites = visualInfo.map((v, index) => {
            const tileId = v.imageId;
            const tileConfig = this._getTileConfig(tileId);

            if (!tileConfig) {
                failCount++;
                failedTiles.push(tileId);
                return null;
            }

            v.convertedX = v.posX * SCALE_FACTOR;
            const flashY = GROUND_LEVEL - (v.posY * SCALE_FACTOR) + Y_OFFSET;
            v.convertedY = (flashY * this.scaleY) + PS2_Y_OFFSET;

            const sprite = {
                x: v.convertedX,
                y: v.convertedY,
                w: tileConfig.w * (v.scaleX || 1),
                h: tileConfig.h * (v.scaleY || 1),
                zindex: v.depth,
                u1: tileConfig.x,
                v1: tileConfig.y,
                u2: tileConfig.x + tileConfig.w,
                v2: tileConfig.y + tileConfig.h,
                r: 128,
                g: 128,
                b: 128,
                a: 128
            };

            successCount++;

            return sprite;
        }).filter(sprite => sprite !== null);

        return sprites;
    }

    _getTileConfig(tileId) {
        for (let i = 0; i < this.tileConfigs.length; i++) {
            const config = this.tileConfigs[i];
            if (config.frames && config.frames[tileId]) {
                return config.frames[tileId].frame;
            }
        }

        return null;
    }

    _createInstances() {
        const bgSprites = this._createSpriteData(this.layers.background);
        const fgSprites = this._createSpriteData(this.layers.foreground);

        const instances = {
            background: new TileMap.Instance({
                descriptor: this.descriptor,
                spriteBuffer: TileMap.SpriteBuffer.fromObjects(bgSprites)
            }),
            foreground: new TileMap.Instance({
                descriptor: this.descriptor,
                spriteBuffer: TileMap.SpriteBuffer.fromObjects(fgSprites)
            })
        };

        TileMap.init();

        return instances;
    }

    updateCamera(cameraX, cameraY) {
        this.cameraX = cameraX;
        this.cameraY = cameraY;
    }

    _isVisible(sprite) {
        const margin = 350;
        return (
            sprite.x + sprite.w >= this.cameraX - margin &&
            sprite.x <= this.cameraX + SCREEN_WIDTH + margin &&
            sprite.y + sprite.h >= this.cameraY - margin &&
            sprite.y <= this.cameraY + SCREEN_HEIGHT + margin
        );
    }

    render(offsetX = 0, offsetY = 0) {
        TileMap.begin();

        if (this.instances.background) {
            this.instances.background.render(offsetX, offsetY);
        }
        if (this.instances.foreground) {
            this.instances.foreground.render(offsetX, offsetY);
        }
    }

    updateSprite(layerType, index, updates) {
        const instance = this.instances[layerType];
        if (!instance) return;

        const layout = TileMap.layout;
        const view = new DataView(instance.getSpriteBuffer());
        const stride = layout.stride;
        const offsets = layout.offsets;

        const setFloat = (idx, offset, value) => {
            view.setFloat32(idx * stride + offset, value, true);
        };

        const setUint = (idx, offset, value) => {
            view.setUint32(idx * stride + offset, value >>> 0, true);
        };

        if (updates.x !== undefined) setFloat(index, offsets.x, updates.x);
        if (updates.y !== undefined) setFloat(index, offsets.y, updates.y);
        if (updates.r !== undefined) setUint(index, offsets.r, updates.r);
        if (updates.g !== undefined) setUint(index, offsets.g, updates.g);
        if (updates.b !== undefined) setUint(index, offsets.b, updates.b);
        if (updates.a !== undefined) setUint(index, offsets.a, updates.a);
    }

    destroy() {
        this.instances = null;
        this.descriptor = null;
        this.layers = null;
    }
}