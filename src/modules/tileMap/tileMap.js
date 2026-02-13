import { ASSETS_PATH, GAME_GROUND_LEVEL, GAME_SCALE_FACTOR, SCREEN_HEIGHT, FLASH_HEIGHT } from "../../shared/constants.js";

export default class TileMapRenderer {
    constructor(mapDataArray) {
        this.scaleY = SCREEN_HEIGHT / FLASH_HEIGHT;
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
        this.instances = this._createInstances();
    }

    _processMapData(mapDataArray) {
        const allVisuals = [];

        for (let i = 0; i < mapDataArray.length; i++) {
            const mapData = mapDataArray[i];

            if (mapData.visualInfo) {
                allVisuals.push(...mapData.visualInfo.map(v => ({
                    ...v,
                    layerType: 'background',
                    imageId: (v.imageId || v.animId).endsWith('.png') ? (v.imageId || v.animId) : (v.imageId || v.animId) + '.png'
                })));
            }

            if (mapData.frontVisualInfo) {
                allVisuals.push(...mapData.frontVisualInfo.map(v => ({
                    ...v,
                    layerType: 'foreground',
                    imageId: (v.imageId || v.animId).endsWith('.png') ? (v.imageId || v.animId) : (v.imageId || v.animId) + '.png'
                })));
            }
        }

        allVisuals.sort((a, b) => a.depth - b.depth);

        return {
            background: allVisuals.filter(v => v.layerType === 'background'),
            foreground: allVisuals.filter(v => v.layerType === 'foreground')
        };
    }

    _createDescriptor(offsets) {
        return new TileMap.Descriptor({
            textures: this.SPRITE_SHEETS,
            materials: offsets.map((offset, idx) => ({
                texture_index: idx,
                blend_mode: Screen.alphaEquation(
                    Screen.SRC_RGB, Screen.DST_RGB, 
                    Screen.SRC_ALPHA, Screen.DST_RGB, 
                    0
                ),
                end_offset: offset
            }))
        });
    }

    _getTileConfig(tileId) {
        for (let i = 0; i < this.tileConfigs.length; i++) {
            if (this.tileConfigs[i].frames && this.tileConfigs[i].frames[tileId]) {
                return { config: this.tileConfigs[i].frames[tileId], textureIndex: i };
            }
        }
        return null;
    }

    _prepareLayerSprites(visualInfo) {
        const Y_OFFSET = 36;
        const PS2_Y_OFFSET = SCREEN_HEIGHT === 448 ? 30 : 0;

        const spritesByTexture = [[], [], []];

        visualInfo.forEach((v) => {
            const res = this._getTileConfig(v.imageId);
            if (!res) return;

            const { config, textureIndex } = res;

            const convertedX = v.posX * GAME_SCALE_FACTOR;
            const flashY = GAME_GROUND_LEVEL - (v.posY * GAME_SCALE_FACTOR) + Y_OFFSET;
            const convertedY = (flashY * this.scaleY) + PS2_Y_OFFSET;

            const trimX = (config.spriteSourceSize.x || 0) * GAME_SCALE_FACTOR;
            const trimY = (config.spriteSourceSize.y || 0) * GAME_SCALE_FACTOR;

            spritesByTexture[textureIndex].push({
                x: convertedX + trimX,
                y: convertedY + trimY,
                w: config.frame.w * (v.scaleX || 1),
                h: config.frame.h * (v.scaleY || 1),
                zindex: v.depth,
                u1: config.frame.x,
                v1: config.frame.y,
                u2: config.frame.x + config.frame.w,
                v2: config.frame.y + config.frame.h,
                r: 128, g: 128, b: 128, a: 128
            });
        });

        const allSprites = [...spritesByTexture[0], ...spritesByTexture[1], ...spritesByTexture[2]];

        const offsets = [
            spritesByTexture[0].length - 1,
            spritesByTexture[0].length + spritesByTexture[1].length - 1,
            spritesByTexture[0].length + spritesByTexture[1].length + spritesByTexture[2].length - 1
        ].map(o => Math.max(0, o));

        return { allSprites, offsets };
    }

    _createInstances() {
        TileMap.init();

        const bgData = this._prepareLayerSprites(this.layers.background);
        const fgData = this._prepareLayerSprites(this.layers.foreground);

        return {
            background: new TileMap.Instance({
                descriptor: this._createDescriptor(bgData.offsets),
                spriteBuffer: TileMap.SpriteBuffer.fromObjects(bgData.allSprites)
            }),
            foreground: new TileMap.Instance({
                descriptor: this._createDescriptor(fgData.offsets),
                spriteBuffer: TileMap.SpriteBuffer.fromObjects(fgData.allSprites)
            })
        };
    }

    updateCamera(cameraX, cameraY) {
        this.cameraX = cameraX;
        this.cameraY = cameraY;
    }

    render(offsetX = 0, offsetY = 0) {
        TileMap.begin();

        TileMap.setCamera(-this.cameraX, -this.cameraY);

        if (this.instances.background) this.instances.background.render(offsetX, offsetY);
        if (this.instances.foreground) this.instances.foreground.render(offsetX, offsetY);
    }

    updateSprite(layerType, index, updates) {
        const instance = this.instances[layerType];
        if (!instance) return;

        const layout = TileMap.layout;
        const view = new DataView(instance.getSpriteBuffer());
        const stride = layout.stride;
        const pos = index * stride;

        if (updates.x !== undefined) view.setFloat32(pos + layout.offsets.x, updates.x, true);
        if (updates.y !== undefined) view.setFloat32(pos + layout.offsets.y, updates.y, true);
        if (updates.r !== undefined) view.setUint32(pos + layout.offsets.r, updates.r >>> 0, true);
        if (updates.g !== undefined) view.setUint32(pos + layout.offsets.g, updates.g >>> 0, true);
        if (updates.b !== undefined) view.setUint32(pos + layout.offsets.b, updates.b >>> 0, true);
        if (updates.a !== undefined) view.setUint32(pos + layout.offsets.a, updates.a >>> 0, true);
    }

    destroy() {
        this.instances = null;
        this.tileConfigs = null;
        this.layers = null;
    }
}