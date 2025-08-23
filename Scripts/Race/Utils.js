import { Bodies, Composite } from 'matter-js';
import { World } from "matter-js";


export function generateFollowerBody(follower,size,ShowTexture,engine,bodies){
    const proxiedUrl = `http://localhost:3000/api/image?url=${encodeURIComponent(follower.image_url)}`;
    
    const img = new Image();
    img.src = proxiedUrl;
    img.crossOrigin = "anonymous"; 

    img.onload = (() => {
        const random = Math.floor(Math.random() *  800);
        const random2 = Math.floor(Math.random() * -3000);

        const originalTextureSize = size * 5;
        const texture = ShowTexture ? createCircularTexture(img, originalTextureSize) : '';
        const box = Bodies.circle(random, 0 + random2, size, {
            restitution: 0.7,
            render: {
                sprite: {
                    xScale: (size * 2) / originalTextureSize, 
                    yScale: (size * 2) / originalTextureSize,
                    originalTextureSize: originalTextureSize,
                }
            },
            data: follower
        });
        if(ShowTexture){
            box.render.sprite.texture = texture; // ajoute la texture ronde
        }
        Composite.add(engine.world, box); // ajoute immédiatement quand l'image est prête
        bodies.push(box);

    });

    img.onerror = () => {
    console.error("Image failed to load:", proxiedUrl);
    };
}

export function createCircularTexture(img, size) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx?.beginPath();
      ctx?.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx?.closePath();
      ctx?.clip(); // tout ce qui sort du cercle sera masqué

      ctx?.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL(); // retourne une URL de texture ronde
    }

    export function getLowestBody(world) {
      let lowest = null;
      let maxY = -Infinity;

      for (const body of world.bodies) {
        if (!body.isStatic && body.position.y > maxY) {
          maxY = body.position.y;
          lowest = body;
        }
        if (!body.isStatic && (body.position.x < 0 || body.position.x > 800)) {
          World.remove(world, body);
          continue; // passer au corps suivant
        }
      }
     
      return lowest; // ou juste maxY si tu veux seulement la coordonnée
    }
