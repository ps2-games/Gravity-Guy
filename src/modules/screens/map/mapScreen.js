import { Map } from "./map.js";

const startMission = {

    objects: [],

    init(texture, texture1, texture2) {

        const pillar = new Map(3, 323 , 0, 4, 41, 223, texture);
        const rock = new Map(224.9, 126.4, 237, 91, 40, 44, texture2);
       



        this.objects.push(pillar, rock);
    },

    draw() {

        this.objects.forEach(obj => 

            obj.draw());
    
    }
};

export default startMission;