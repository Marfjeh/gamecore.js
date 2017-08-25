/*
*@author Marfjeh
*/

/*
Todo: first: Rewrite this horrible mess Or make it less spagetti like. Or move away from nOdE.Js
Idea: Load a .js or json file for a example a map, so that example you can load a diffrent map in the world,
 have the right spawn points, and make it more modulear and use the kernel.js for only the main functions like rconsend sentitle etc.
 so that the spawnpoints are not hardcoded. and the zombielimit is also changeable. and abbility to run more commands for example opening a door.

 todo2: make a way to have C# like timers in node. I really dislike/hate the way how setinterval and settimeouts works. it makes my skin crawl.

Idea2: Cutscenes.
*/

const Rcon = require('modern-rcon');
var host = "127.0.0.1";
var rconpassword = "lel";
var rconport = 25575;

var G_wave = 0;
var G_maxzombies = 0;
var G_zombiesspawned = 0;
var G_zombiespawnpoints = ["-1660 5 228", "-1640 5 236", "-1634 5 260", "-1684 4 259"];

function rconsend(command) {
    console.log("[>>] /" + command);
    const rconserver = new Rcon(host, rconport, rconpassword);
    rconserver.connect().then(() => {
        return rconserver.send(command);
    }).then(res => {
        console.log("[<<] " + res);
    }).then(() => {
        return rconserver.disconnect();
    })
}

function sendtitle(player, title, color = "white") {
    rconsend('title ' + player +' title ["",{"text":"' + title + '","color":"'+ color +'","bold":false}]');
}

function playsound(sound, player, volume, pos = "~ ~ ~", pitch = "1") {
    rconsend("playsound " + sound + " voice " + player + " " + pos + " " + volume + " " + pitch);
}

function StartGame() {
    rconsend("time set 18000");
    G_wave ++;
    G_maxzombies = 10;
    G_zombiesspawned = 0;
    playsound("mwavestart", "@a", "999999");
    playsound("level", "@a", "999999");
    var musiclooper = setInterval(function () {
        playsound("level", "@a", "999999");
    }, 60000); //Change this in a function instead so that you can destroy the interval.
    sendtitle("@a", "Wave: " + G_wave, "red");
    ZombieSpawnTimer(G_maxzombies, 6000)
}

function nextwave() {
    playsound("waveend", "@a", "999999");
    G_wave ++;
    G_zombiesspawned = 0;
    G_maxzombies = G_maxzombies + 2;
    setTimeout(function() {
        sendtitle("@a", "Wave: " + G_wave, "red");
        playsound("mwavestart", "@a", "999999");
        ZombieSpawnTimer(G_maxzombies, 3000);
    }, 9000);
    
}

function RapidZombieWave(delay, maxzombies) {
    playsound("waverapid", "@a", "99999");
    //todo: Spawn a armor stand, and let it spreak randomly on the gamemap. 
    rconsend("summon armo")
}

function Perk() {
    
}

function TheBox() {

}

function mobofthedead() {
    rconsend("tp @a -1742 4 235");
    rconsend("gamemode 2");
    playsound("mintro", "@a", "99999");
    G_zombiespawnpoints = ["-1754 5 238", "-1754 5 251", "-1742 5 272", "-1733 5 269", "-1744 5 222"];
    console.log("[i] Mob of the dead loaded.");
    setTimeout(function() { StartGame(); }, 40000);
}

function StopGame() {
    sendtitle("@a", "GameOver", "red");
    playsound("gameover", "@a", "999999");
    rconsend("kill @e[type=!player]");
    //clearInterval(musiclooper); //this doesnt work you blithering idiot!
    G_maxzombies = 0;
    G_zombiesspawned = 0;
    G_wave = 0;
}

function ZombieSpawnTimer(maxzombies, spawninterval, action) {
    var zombietimer = setInterval(function() { 
            rconsend("summon minecraft:zombie " + G_zombiespawnpoints[Math.floor(Math.random() * G_zombiespawnpoints.length)]);
            G_zombiesspawned ++;
            console.log("Spawning zombie " + G_zombiesspawned + "/" + maxzombies + " interval: " + spawninterval + "ms.")
            if(G_zombiesspawned >= maxzombies) {
                clearInterval(zombietimer);
                testforZombies();
            }
    }, spawninterval);
}

function testforZombies(action) { //oh my god.
    var testforzombie = setInterval(function() {
            const rconserver = new Rcon(host, rconport, rconpassword);
            rconserver.connect().then(() => {
                return rconserver.send("testfor @e[type=Zombie]");
            }).then(res => {
                if (res.includes("Found Zombie") === false)
                    {
                        nextwave();
                        clearInterval(testforzombie);
                    }
            }).then(() => {
                return rconserver.disconnect();
            })
        }, 1000 );
}

console.log("[i] GameCore Ready.");
console.warn("[!] Default IP: " + host + ", Port: " + rconport + ", Password: " +  rconpassword)
console.log("[i] [<<] = Response from server. [>>] = Send command/data to server.\nInternal Messages: [!] = Warning. [i] = Infromation. [X] = Error.\n---------------");

const stdin = process.openStdin();
stdin.addListener("data", function(d) {
	var readline = d.toString().trim();

    if (readline.startsWith("host")) {
        console.log("Set host to: [" + readline.substring(5)+ "]");
        host = readline.substring(5);
    }
    else if (readline.startsWith("pass")) {
        console.log("Set pass to: [" + readline.substring(5)+ "]");
        rconpassword = readline.substring(5);
    }
    else if (readline.startsWith("port")) {
        console.log("Set port to [" + readline.substring(5) + "]");
        rconport = parseInt(readline.substring(5));
    }
    else if (readline === "start") {
        rconsend("kill @e[type=!player]");
        StartGame();
    }
    else if (readline === "stop") {
        StopGame();
    }
    else if (readline === "nxtwave") {
        rconsend("kill @e[type=!player]");
        nextwave();
    }
    else if (readline === "killz") {
       rconsend("kill @e[type=!player]");
    }
    else if (readline === "m_dead") {
       mobofthedead();
     }
    else{
        console.log(rconsend(readline));
    }
})