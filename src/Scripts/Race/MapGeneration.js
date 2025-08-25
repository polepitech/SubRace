import { Bodies, Composite, Engine, Render, Runner, Body, Events } from 'matter-js';

const factories = [
  (engine,offset) => makeCenteredPyramid({ centerX: 400, offset, rows: 8, radius: 40, gap: 150 }, engine, Composite, Bodies),
  (engine,offset) => makeCoulissant({ offset }, engine),
  (engine,offset) => makeRalentisseur({ offset }, engine),
  (engine,offset) => makeFaux({ offset }, engine),
  (engine,offset) => makeCenteredPyramid({ centerX: 400, offset, rows: 8, radius: 40, gap: 150 }, engine, Composite, Bodies),

];

export  function generateMap(engine,Height) {
  shuffle(factories);
  makeStarter(engine);
  const numberOfLevel = Math.floor(Height / 2000);
  for (let i = 0; i < numberOfLevel; i++) {
    const funct = factories[i];
    funct(engine, (i * 2000)+0);
  }
}



export  function makeCenteredPyramid({ offset,centerX, rows, radius, gap = 2 },engine) {
    const world = engine.world;
    const d = radius * 2 + gap; 
    for (let r = 0; r < rows; r++) {
        const count = rows - r; // 5,4,3,2,1 ...
        const rowWidth = (count - 1) * d;
        const startX = centerX - rowWidth / 2;
        const y = offset + r * d;
        for (let i = 0; i < count; i++) {
          const x = startX + i * d;
          Composite.add(world, Bodies.circle(x, y, radius, {
              restitution: 0.9,
              // friction: 0.1,
              isStatic: true,
          }));
        }
      const rallentisseurs = [
        Bodies.rectangle(100, offset+1300, 600, 60, { isStatic: true,angle: Math.PI / 3 }),
        Bodies.rectangle(700, offset+1300, 600, 60, { isStatic: true,angle: Math.PI / -3 }),
      ];
      Composite.add(world, rallentisseurs);
    }
}

export function makeFaux({offset},engine){
    let faux = [
      Bodies.rectangle(200, offset, 400, 60, { isStatic: true }),
      Bodies.rectangle(600, offset, 400, 60, { isStatic: true }),
      Bodies.rectangle(600, offset+500, 400, 60, { isStatic: true }),
      Bodies.rectangle(200, offset+500, 400, 60, { isStatic: true }),

      Bodies.rectangle(200, offset+1000, 400, 60, { isStatic: true }),
      Bodies.rectangle(600, offset+1000, 400, 60, { isStatic: true }),
      Bodies.rectangle(600, offset+1500, 400, 60, { isStatic: true }),
      Bodies.rectangle(200, offset+1500, 400, 60, { isStatic: true }),
    ];
    let angle = 0;
    Events.on(engine, "afterUpdate", () => {
      for (let i = 0; i < faux.length; i++) {
        angle += 0.01; 
        Body.setAngle(faux[i], i % 2 == 0 ? angle : -angle);
      }
    });
    Composite.add(engine.world, faux);
}

export function makeRalentisseur({offset},engine){
      const rallentisseurs = [
        Bodies.rectangle(200, offset+600, 600, 60, { isStatic: true,angle: Math.PI / 10 }),
        Bodies.rectangle(600, offset+900, 600, 60, { isStatic: true,angle: Math.PI / -10 }),
        Bodies.rectangle(200, offset+1200, 600, 60, { isStatic: true,angle: Math.PI / 10 }),
        Bodies.rectangle(600, offset+1500, 600, 60, { isStatic: true,angle: Math.PI / -10 }),
      ]
      Composite.add(engine.world, rallentisseurs);
}

export function makeCoulissant({offset},engine){
      const coulissants = [
        Bodies.rectangle(200, offset+300, 600, 60, { isStatic: true}),
        Bodies.rectangle(800, offset+600, 600, 60, { isStatic: true }),
        Bodies.rectangle(200, offset+900, 600, 60, { isStatic: true}),
        Bodies.rectangle(600, offset+1200, 600, 60, { isStatic: true}),
        Bodies.rectangle(200, offset+1500, 600, 60, { isStatic: true}),
        Bodies.rectangle(800, offset+1900, 600, 60, { isStatic: true }),
      ]
      Composite.add(engine.world, coulissants);

      let t = 0;
      let phase = false;
      let decallage = 5
      Events.on(engine, "afterUpdate", () => {
        phase % 2 == 0 ?  t += 0.05 : t -= 0.05;

        for (let i = 0; i < coulissants.length; i++) {
          const body = coulissants[i];
          const baseX = body.position.x; 
          const y = body.position.y;
          if(i % 2 == 0){
            var x = phase ? baseX - (t*decallage) : baseX + (t*decallage);
          }else{
            var x = phase ? baseX + (t*decallage) : baseX - (t*decallage);
          }
          Body.setPosition(body, { x, y });
        }
        if (t > 5) {
          phase = true;
        } else if (t < 0) {
          phase = false;
        }
      });

}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }
  return array;
}

function makeStarter(engine){
    let sol =  Bodies.rectangle(400, -200, 800, 60, { isStatic: true });
    Composite.add(engine.world, sol);
    let timmer = 0;
    Events.on(engine, "afterUpdate", () => {
      timmer ++
      if(timmer >= 180){
        Composite.remove(engine.world, sol); 
      }
    });
}

