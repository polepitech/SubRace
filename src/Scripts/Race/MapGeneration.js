import { Bodies, Composite, Body, Events } from 'matter-js';

const factories = [
  (engine,offset,width) => makeFaux({ offset }, engine,width),
  (engine,offset,width) => makeFaux2({ offset }, engine,width),
  (engine,offset,width) => makeCenteredPyramid({ centerX: width/2, offset, rows: 8, radius: 40, gap: 180 }, engine, Composite, Bodies),
  (engine,offset,width) => makeCoulissant({ offset }, engine,width),
  (engine,offset,width) => makeRalentisseur({ offset }, engine,width),
];

export  function generateMap(engine,Height,Width) {
  shuffle(factories);
  makeStarter(engine,Width);
  const numberOfLevel = Math.floor(Height / 2000);
  for (let i = 0; i < numberOfLevel; i++) {
    if(!factories[i]){
      let index = Math.floor(Math.random()*factories.length);
      const funct = factories[index];
      funct(engine, (i * 2000)+0,Width);
    }else{
      const funct = factories[i];
      funct(engine, (i * 2000)+0,Width);
    }
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
        Bodies.rectangle(100, offset+1000, 600, 60, { isStatic: true,angle: Math.PI / 3 }),
        Bodies.rectangle(980, offset+1000, 600, 60, { isStatic: true,angle: Math.PI / -3 }),
      ];
      Composite.add(world, rallentisseurs);
    }
}

  export function makeFaux({ offset }, engine, width) {
    const W = width;
    const baseY = offset + 1300;

    // Obstacles fixes
    const faux = [
      Bodies.rectangle(W/2,        offset+300,  W/2, 60, { isStatic: true }),
      Bodies.rectangle(W/2,        offset+300,   60, W/2, { isStatic: true }),
      Bodies.rectangle(W/4,        offset+800,  W/2, 60, { isStatic: true }),
      Bodies.rectangle(W/4,        offset+800,   60, W/2, { isStatic: true }),
      Bodies.rectangle(W - W/4,    offset+800,  W/2, 60, { isStatic: true }),
      Bodies.rectangle(W - W/4,    offset+800,   60, W/2, { isStatic: true }),
    ];

    const rallentisseurs = [
      Bodies.rectangle(100, offset+1000, 600, 60, { isStatic: true, angle:  Math.PI / 3 }),
      Bodies.rectangle(980, offset+1000, 600, 60, { isStatic: true, angle: -Math.PI / 3 }),
    ];

    // Poussoir (plaque mobile)
    const poussoirs = [
      // Bodies.rectangle(W/2-W/3, baseY, W/3, 60, { isStatic: true }),
      Bodies.rectangle(W/2, baseY, W/3, 60, { isStatic: true }),
      // Bodies.rectangle(W/2+W/3, baseY, W/3, 60, { isStatic: true }),

    ]

    // Ajout au monde
    Composite.add(engine.world, [...faux, ...rallentisseurs, ...poussoirs]);

    let angle = 0;
    // Animation rotation + poussoir
    Events.on(engine, "afterUpdate", () => {
      // rotation alternée
      const t = engine.timing.timestamp / 1000; // secondes
      angle += 0.06
      for (let i = 0; i < faux.length; i++) {
        Body.setAngle(faux[i], i>=4 && i<=6?-angle:angle);
      }

      // --- Mouvement du poussoir (SINUS RAPIDE) ---
      const amp = 220;          // amplitude verticale
      const freq = 0.3;         // Hz (allers-retours par seconde)
      const y = baseY + Math.sin(t * 2 * Math.PI * freq) * amp;
      for (let i = 0; i < poussoirs.length; i++) {
        Body.setPosition(poussoirs[i], { x: poussoirs[i].position.x, y});
      }
    });
  }


export function makeFaux2({offset},engine,width){
  
    let faux = [
      Bodies.rectangle(width/4, offset+300, width/2, 60, { isStatic: true }),
      Bodies.rectangle(width-width/4, offset+300, width/2, 60, { isStatic: true }),
      Bodies.rectangle(width-width/4, offset+800, width/2, 60, { isStatic: true }),
      Bodies.rectangle(width/4, offset+800, width/2, 60, { isStatic: true }),

      Bodies.rectangle(width/4, offset+1300, width/2, 60, { isStatic: true }),
      Bodies.rectangle(width-width/4, offset+1300, width/2, 60, { isStatic: true }),
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

export function makeRalentisseur({offset},engine,width){
      const rallentisseurs = [
        Bodies.rectangle(200, offset+600, width-200, 60, { isStatic: true,angle: Math.PI / 10 }),
        Bodies.rectangle(width-200, offset+900, width-200, 60, { isStatic: true,angle: Math.PI / -10 }),
        Bodies.rectangle(200, offset+1200, width-200, 60, { isStatic: true,angle: Math.PI / 10 }),
        Bodies.rectangle(width-200, offset+1500, width-200, 60, { isStatic: true,angle: Math.PI / -10 }),
      ]
      Composite.add(engine.world, rallentisseurs);
}

export function makeCoulissant({offset},engine,width){
      const coulissants = [
        Bodies.rectangle(200, offset+300, width, 60, { isStatic: true}),
        Bodies.rectangle(width, offset+600, width, 60, { isStatic: true }),
        Bodies.rectangle(200, offset+900, width, 60, { isStatic: true}),
        Bodies.rectangle(width, offset+1200, width, 60, { isStatic: true}),
        Bodies.rectangle(200, offset+1500, width, 60, { isStatic: true}),
        Bodies.rectangle(width, offset+1800, width, 60, { isStatic: true }),
      ]
      Composite.add(engine.world, coulissants);

      let t = 0;
      let phase = false;
      let decallage = 10
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

function makeStarter(engine,Width){
    let sol =  Bodies.rectangle(Width/2, -200, Width, 60, { isStatic: true });
    Composite.add(engine.world, sol);
    let timmer = 0;
    Events.on(engine, "afterUpdate", () => {
      timmer ++
      if(timmer >= 180){
        Composite.remove(engine.world, sol); 
      }
    });
}

