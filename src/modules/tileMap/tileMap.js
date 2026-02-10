import { ASSETS_PATH } from "../../shared/constants.js";

export default class TileMapRenderer {
    constructor(mapDataArray, viewportWidth, viewportHeight) {
        console.log("=== TileMapRenderer Constructor ===");
        console.log("Viewport:", viewportWidth, "x", viewportHeight);
        console.log("Map data count:", mapDataArray.length);

        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.cameraX = 0;
        this.cameraY = 0;
        this.cullingMargin = 64;
        this.FLASH_HEIGHT = 480;
        this.scaleY = this.viewportHeight / this.FLASH_HEIGHT;

        console.log("Loading tile configs...");
        this.tileConfigs = [
            JSON.parse(std.loadFile(ASSETS_PATH.TEXTURES + "/texture-0.json")),
            JSON.parse(std.loadFile(ASSETS_PATH.TEXTURES + "/texture-1.json")),
            JSON.parse(std.loadFile(ASSETS_PATH.TEXTURES + "/texture-2.json")),
        ];

        console.log("Tile config 0 frames:", this.tileConfigs[0].frames ? Object.keys(this.tileConfigs[0].frames).length : 0);
        console.log("Tile config 1 frames:", this.tileConfigs[1].frames ? Object.keys(this.tileConfigs[1].frames).length : 0);
        console.log("Tile config 2 frames:", this.tileConfigs[2].frames ? Object.keys(this.tileConfigs[2].frames).length : 0);

        if (this.tileConfigs[0].frames) {
            const sampleKeys = Object.keys(this.tileConfigs[0].frames).slice(0, 3);
            console.log("Sample frame keys from config 0:", sampleKeys);
        }

        this.SPRITE_SHEETS = [
            ASSETS_PATH.TEXTURES + "/texture-0.png",
            ASSETS_PATH.TEXTURES + "/texture-1.png",
            ASSETS_PATH.TEXTURES + "/texture-2.png",
        ];

        console.log("Processing map data...");
        this.layers = this._processMapData(mapDataArray);

        console.log("Creating descriptor...");
        this.descriptor = this._createDescriptor();

        console.log("Creating instances...");
        this.instances = this._createInstances();

        console.log("=== TileMapRenderer Ready ===");
    }

    _processMapData(mapDataArray) {
        const allVisuals = [];
        let totalBackgroundCount = 0;
        let totalForegroundCount = 0;

        for (let i = 0; i < mapDataArray.length; i++) {
            const mapData = mapDataArray[i];
            console.log(`Map ${i}:`, JSON.stringify(
                {
                    hasVisualInfo: !!mapData.visualInfo,
                    visualCount: mapData.visualInfo ? mapData.visualInfo.length : 0,
                    hasFrontVisualInfo: !!mapData.frontVisualInfo,
                    frontVisualCount: mapData.frontVisualInfo ? mapData.frontVisualInfo.length : 0
                }
            ));

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

                if (i === 0 && bgVisuals.length > 0) {
                    console.log("First background visual:", JSON.stringify(
                        {
                            imageId: bgVisuals[0].imageId,
                            posX: bgVisuals[0].posX,
                            posY: bgVisuals[0].posY,
                            depth: bgVisuals[0].depth
                        }
                    ));
                }

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

        console.log("Total visuals found:", allVisuals.length);
        console.log("  - Background:", totalBackgroundCount);
        console.log("  - Foreground:", totalForegroundCount);

        allVisuals.sort((a, b) => a.depth - b.depth);

        const layers = {
            background: allVisuals.filter(v => v.layerType === 'background'),
            foreground: allVisuals.filter(v => v.layerType === 'foreground')
        };

        console.log("Processed layers:", JSON.stringify({
            background: layers.background.length,
            foreground: layers.foreground.length
        }));


        const nearOrigin = allVisuals.filter(v =>
            Math.abs(v.posX) < 500 && Math.abs(v.posY) < 500
        );
        console.log(`Found ${nearOrigin.length} tiles near origin (0,0)`);
        if (nearOrigin.length > 0) {
            console.log("First 5 origin tiles:", nearOrigin.slice(0, 5).map(v => (JSON.stringify({
                id: v.imageId,
                posX: v.posX,
                posY: v.posY,
                depth: v.depth
            }))));
        }

        return layers;
    }

    _createDescriptor() {
        console.log("Creating TileMap.Descriptor...");

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

        console.log("Descriptor created successfully");
        return descriptor;
    }

    _createSpriteData(visualInfo) {
        console.log(`Creating sprite data for ${visualInfo.length} visuals...`);

        const GROUND_LEVEL = 425;
        const SCALE_FACTOR = 0.641509;
        const Y_OFFSET = 36;
        const PS2_Y_OFFSET = this.viewportHeight === 448 ? 30 : 0;

        let successCount = 0;
        let failCount = 0;
        const failedTiles = [];

        const sprites = visualInfo.map((v, index) => {
            const tileId = v.imageId;
            const tileConfig = this._getTileConfig(tileId);

            if (!tileConfig) {
                console.log(`[${index}] Tile config not found: "${tileId}"`);
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
                r: 255,
                g: 255,
                b: 255,
                a: 255
            };

            successCount++;

            if (index === 0) {
                console.log("First sprite created:", JSON.stringify(
                    {
                        tileId: tileId,
                        position: { x: sprite.x, y: sprite.y },
                        size: { w: sprite.w, h: sprite.h },
                        uv: { u1: sprite.u1, v1: sprite.v1, u2: sprite.u2, v2: sprite.v2 }
                    }
                ));
            }

            return sprite;
        }).filter(sprite => sprite !== null);

        console.log(`Sprite creation: ${successCount} success, ${failCount} failed`);

        if (failCount > 0) {
            console.log("Failed tiles (first 10):", failedTiles.slice(0, 10));
        }

        return sprites;
    }

    _getTileConfig(tileId) {
        if (!tileId) {
            console.log("getTileConfig: tileId is null/undefined");
            return null;
        }

        for (let i = 0; i < this.tileConfigs.length; i++) {
            const config = this.tileConfigs[i];
            if (config.frames && config.frames[tileId]) {
                return config.frames[tileId].frame;
            }
        }

        const tileIdWithoutExt = tileId.replace('.png', '');
        for (let i = 0; i < this.tileConfigs.length; i++) {
            const config = this.tileConfigs[i];
            if (config.frames && config.frames[tileIdWithoutExt]) {
                console.log(`Found tile without .png extension: ${tileIdWithoutExt}`);
                return config.frames[tileIdWithoutExt].frame;
            }
        }

        return null;
    }

    _createInstances() {
        console.log("Creating TileMap instances...");

        const bgSprites = this._createSpriteData(this.layers.background);
        const fgSprites = this._createSpriteData(this.layers.foreground);

        console.log("Background sprites created:", bgSprites.length);
        console.log("Foreground sprites created:", fgSprites.length);

        if (bgSprites.length === 0 && fgSprites.length === 0) {
            console.log("WARNING: No sprites were created! Check tile configurations.");
            console.log("Common issues:");
            console.log("  1. imageId/animId in map JSON doesn't match frame keys in texture JSON");
            console.log("  2. Missing .png extension in frame keys");
            console.log("  3. Texture config files not loaded correctly");
        }

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

        console.log("Instances created successfully");
        return instances;
    }

    updateCamera(cameraX, cameraY) {
        this.cameraX = cameraX;
        this.cameraY = cameraY;
    }

    _isVisible(sprite) {
        const margin = this.cullingMargin;
        return (
            sprite.x + sprite.w >= this.cameraX - margin &&
            sprite.x <= this.cameraX + this.viewportWidth + margin &&
            sprite.y + sprite.h >= this.cameraY - margin &&
            sprite.y <= this.cameraY + this.viewportHeight + margin
        );
    }

    render(offsetX = 0, offsetY = 0) {
        TileMap.begin();

        TileMap.setCamera(0, 0);

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
        console.log("Destroying TileMapRenderer...");
        this.instances = null;
        this.descriptor = null;
        this.layers = null;
    }
}