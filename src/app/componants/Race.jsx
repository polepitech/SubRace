'use client'
import Matter from "matter-js";
import React, { useEffect, useRef, useState } from 'react';
import { generateMap } from "../../Scripts/Race/MapGeneration";
import { createCircularTexture, generateFollowerBody, getLowestBody } from "../../Scripts/Race/Utils";



export const Race = () => {
 

  const frames = [];
  let frame = 0;

  const [followers, setFollowers] = useState([]);
  const [races, setRaces] = useState(null);

  const boxRef = useRef(null);
  
  let mainSpeed = 1; 
  let delayBeforeEnd = 0;
  
  let asFinish = false;
  let asfirst = false;
  let asSecond = false;
  let asThird = false;
  const podiumTextures = {}; 
  
  
  
  const Height = 8200;
  const Width = 500;
  const size = 25; // taille des followers 
  const Multipy_Number = 1;

  
  
  ///// DEBUG ////////
  const pause = useRef(false)
  const ShowTexture = true; 
  const showDebug = false;
  const [debug, setdebug] = useState('')

  const exportAfterGame = useRef(true);
  const postOnIg = useRef(false);



  useEffect(() => {
    window.gameFinished = false;

    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3000/api/users');
      const followers = await response.json();
      console.log(followers);

      const multiplied = Array(Multipy_Number).fill(followers).flatMap(x => x);
      setFollowers(multiplied);
      console.log("followers", multiplied.length);
    };
    fetchUsers();

    const fetchRaces = async () => {
      const response = await fetch('http://localhost:3000/api/races');
      const races = await response.json();
      console.log("races", races);
      setRaces(races);
    };
    fetchRaces();
  }, [])


  
  useEffect(() => {
    if (followers.length === 0 || races == null) return; // attendre les données
    
      // module aliases
      const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Events = Matter.Events,
            Body = Matter.Body;
        
    
      // create an engine
      const engine = Engine.create();
    
      // create a renderer
      const render = Render.create({
          element: boxRef.current,
          engine: engine,
          options: {
            width: Width,
            height: 800,
            background: "#EE2A35",
            wireframes: false,
          },
      });

      const canvas = render.canvas;



      //////// CREER FOLLOWERS BODY /////////
      const bodies = [];

      followers.forEach(follower => {
        generateFollowerBody(follower,size,ShowTexture,engine,bodies);
      });

      //////// CREER MAP /////////
      //////// CREER MAP /////////

      const ground = Bodies.rectangle(400, Height, 810, 60, { isStatic: true ,render:{fillStyle:"#009736"}});
      const finishBandeau = Bodies.rectangle(400, Height-150, 800, 300, { 
        isStatic: true,  
        collisionFilter: { category: 0x0002, mask: 0x0000 } ,
        render:{sprite:{
          texture:'/finish.jpg',
          xScale: 1,
          yScale: 1
        }}});

      const wallL = Bodies.rectangle(0,   Height/2-1000, 60, Height+2000, { isStatic: true });
      const wallR = Bodies.rectangle(800, Height/2-1000, 60, Height+2000, { isStatic: true });


      Composite.add(engine.world, [finishBandeau,ground, wallL, wallR]);

      generateMap(engine,Height);
  
      const FPS = 30;
      const DELTA = 1000 / FPS; // durée d'une frame en ms (~40 ms pour 25 fps)


      /// FRAMES////
      const intervalId = setInterval(() => {

        if(pause.current) return; 
        if(asFinish && delayBeforeEnd > 90) {
          if(exportAfterGame.current) exportVideo(frames);
          clearInterval(intervalId);
          return
        }; // ne pas continuer si la course est finie
        Engine.update(engine, DELTA * mainSpeed);
        Render.world(render);
        frame++;
      }, DELTA);

   


      Events.on(engine, "afterUpdate", () => {

        const lowestBody = getLowestBody(engine.world);
        let lowestY = lowestBody ? lowestBody.position.y : 0;
        window.etat = lowestY /Height *100 ;
        setdebug(Math.floor(lowestY));
        if(lowestY > Height-300){
            lowestY = Height-300; 
        }
        checkWinners(bodies,Events,engine);

        
        Render.lookAt(render, {
          min: { x: 0, y: lowestY - Width/2 },
          max: { x: 800, y: lowestY + Width/2 }
        });

        frames.push(render.canvas.toDataURL());
        
      });

  

      Matter.Events.on(render, 'afterRender', function() {
        const ctx = render.context;

        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#EE2A35';
        ctx.fillRect(0, 0, render.options.width, render.options.height);
        ctx.globalCompositeOperation = 'source-over';

        ctx.font = "bold 30px Arial";

        ctx.fillStyle = "white";
        ctx.textAlign = "center"; 
        ctx.fillText("Day: " + (races.length + 1)+" followers: " + followers.length, 250, 650);

        if(asfirst)drawPodium(ctx,  1, asfirst);
        if(asSecond)drawPodium(ctx, 2, asSecond);
        if(asThird)drawPodium(ctx,  3, asThird);

        if(frame < 180){
          drawIntro("Making my followers",0,ctx);
          drawIntro("race every day",40,ctx);
          if(frame > 90 && frame < 120)
          drawIntro("3",120,ctx);
          if(frame > 120 && frame < 150)
          drawIntro("2",120,ctx);          
          if(frame > 150)
          drawIntro("1",120,ctx);
        }




      });
       
      return () => {
        clearInterval(intervalId);
        Render.stop(render);
        Runner.stop(runner);
        Engine.clear(engine);
        render.canvas.remove();
        render.textures = {};
      };
        


     
  }, [followers,races]);







  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        pause.current = !pause.current;
      }
      if (e.code === "KeyP") {
        postOnIg.current = !postOnIg.current;
      }
      if (e.code === "KeyE") {
        exportAfterGame.current = !exportAfterGame.current;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  function drawPodium(ctx, place, player) {

    let url = player.image_url;

    if (podiumTextures[place]) {
      ctx.drawImage(podiumTextures[place], (150 * place-100 ), 680);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `http://localhost:3000/api/image?url=${encodeURIComponent(url)}`;
    img.onload = () => {
      const textureURL = createCircularTexture(img, 100);
      const circularImg = new Image();
      circularImg.src = textureURL;
      circularImg.onload = () => {
        podiumTextures[place] = circularImg; // stocker pour les prochaines frames
      };
    };
  }

  const drawIntro = (text,offset,ctx) => {
    ctx.save();
    if(offset > 100){
      ctx.font = "bold 50px Arial";
    }else{
      ctx.font = "bold 30px Arial";
    }

    ctx.textAlign = "center";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.strokeText(text, Width / 2, 100+offset);
    ctx.fillStyle = "white";
    ctx.fillText(text, Width / 2, 100+offset);
    ctx.restore();
  };

  function checkWinners(bodies,Events,engine) {
      for (const body of bodies) {
        if(body.position.y > Height-300){
          if (!body.data.finished) {
            if (!asfirst) {
              finishGame(Events,engine);
              body.data.finished = true;
              asfirst = body.data;
              console.log("1ere place", asfirst);
            } else if (!asSecond) {
              body.data.finished = true;
              asSecond = body.data;
              console.log("2eme place", asSecond);
            } else if (!asThird) {
              body.data.finished = true;
              asThird = body.data;
              console.log("3eme place", asThird);
            }
          }
        }
      }

    if(asfirst && asSecond && asThird && !asFinish) {
      delayBeforeEnd ++
      if(delayBeforeEnd > 90){
        asFinish = true;
      }
    }
  }

  function finishGame(Events,engine) {
    mainSpeed = 0.2;
    const resumeFrame = frame + 90;
    Events.on(engine, "afterUpdate", () => {
      if (frame >= resumeFrame) {
        mainSpeed = 1;
      }
    });
  }

  async function exportVideo(frames) {
    if(!exportAfterGame.current) return;
    const vid = await fetch('/api/exportVideo', {
      method: 'POST',
      body: JSON.stringify(frames),
    });
    if(vid.ok && postOnIg.current) {
      const newRace = await fetch('/api/postRace', {
        method: 'POST',
        body: JSON.stringify({ 
          day: races.length+1,
          followers_number: followers.length,
          winner: asfirst.username,
          second: asSecond.username,
          third: asThird.username
        }),
      });
      if(newRace.ok) {
        window.gameFinished = true;
      }else {
        console.error("Erreur API:", newRace.status, newRace.statusText);
        try {
          const errData = await newRace.json(); 
          console.error("Détails:", errData);
        } catch {
          const errText = await newRace.text();
          console.error("Détails (texte brut):", errText);
        }
        window.gameFinished = true;
      }
    }

  }



  return (
    <div className='flex justify-center items-center h-screen w-screen'>
      <div ref={boxRef} className='box '>
        {showDebug && <div className="debug z-10 absolute bottom-5 font-black text-2xl right-10">{debug}</div>}
      </div>
      <div className="absolute bg-red-600 bottom-0 right-0 p-4 font-bold flex flex-col gap-2">
       <p>ExportVideo: {exportAfterGame.current ? 'Oui' : 'Non'}</p>
       <p>Publication: {postOnIg.current ? 'Oui' : 'Non'}</p>
       <p>hauteur: {debug}</p>
      </div>
    </div>
  )
}

