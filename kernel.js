const Rcon = require('modern-rcon');
var host = "192.168.178.29";
var rconpassword = "lel";
var rconport = 25575;

var G_wave = 0;
var G_maxzombies = 0;
var G_zombiesspawned = 0;
var G_zombiespawnpoints = ["-1660 5 228", "-1640 5 236", "-1634 5 260"];

function rconsend(command) {
    console.log("[>>] " + command);
    const rconserver = new Rcon(host, rconport, rconpassword);
    rconserver.connect().then(() => {
        return rconserver.send(command);
    }).then(res => {
        //console.log(res);
    }).then(() => {
        return rconserver.disconnect();
    })
}

function sendtitle(player, title, color = "white") {
    rconsend('title ' + player +' title ["",{"text":"' + title + '","' + color + '":"white","bold":true}]');
}

function playsound(sound, player, volume, pos = "~ ~ ~", pitch = "1") {
    rconsend("playsound " + sound + " voice " + player + " " + pos + " " + volume + " " + pitch);
}

function StartGame() {
    G_wave ++;
    G_maxzombies = 10;
    G_zombiesspawned = 0;
    playsound("wavestart", "@a", "999999");
    playsound("level", "@a", "999999");
    var musiclooper = setInterval(function () {
        playsound("level", "@a", "999999");
    }, 60000);
    sendtitle("@a", "Wave: " + G_wave, "red");
    ZombieSpawnTimer(G_maxzombies, 3000)
   
}

function nextwave() {
    playsound("waveend", "@a", "999999");
    G_wave ++;
    G_maxzombies = G_maxzombies * 2;
    setTimeout(function() {
        sendtitle("@a", "Wave: " + G_wave, "red");
        playsound("wavestart", "@a", "999999");
        ZombieSpawnTimer(G_maxzombies, 3000);
    }, 9000);
    
}

function StopGame() {
    sendtitle("@a", "GameOver" + G_wave, "red");
    playsound("gameover", "@a", "999999");
    rconsend("kill @e[type=!player]");
    clearInterval(zombietimer);
    clearInterval(musiclooper);
    G_maxzombies = 0;
    G_zombiesspawned = 0;
    G_wave = 0;
}

function ZombieSpawnTimer(maxzombies, spawninterval) {
    var zombietimer = setInterval(function() { 
            rconsend("summon minecraft:zombie " + G_zombiespawnpoints[Math.floor(Math.random() * G_zombiespawnpoints.length)]);
            G_zombiesspawned ++;
            console.log("Spawning zombie " + G_zombiesspawned + "/" + maxzombies + " interval: " + spawninterval + "ms.")
            if(G_zombiesspawned >= maxzombies) {
                clearInterval(zombietimer);
                //testforZombies();
            }
    }, spawninterval);
}

function testforZombies() {
    var testforzombie = setInterval(function() {
        testf = rconsend("testfor @e[type=Zombie]");
        console.log(testf);
    }, 500 );
}

console.log("GameCore Ready.");
console.warn("[!] Default IP: " + host + ", Port: " + rconport + ", Password: " +  rconpassword)

const stdin = process.openStdin();
stdin.addListener("data", function(d) {
	var readline = d.toString().trim();

    if (readline.startsWith("host")) {
        console.log("Set host to: [" + readline.substring(5)+ "]");
        host = readline.substring(5);
    }
    if (readline.startsWith("pass")) {
        console.log("Set pass to: [" + readline.substring(5)+ "]");
        rconpassword = readline.substring(5);
    }
    if (readline.startsWith("port")) {
        console.log("Set port to [" + readline.substring(5) + "]");
        rconport = parseInt(readline.substring(5));
    }
    if (readline === "start") {
        rconsend("kill @e[type=!player]");
        StartGame();
    }
    if (readline === "stop") {
        StopGame();
    }
    if (readline === "nxtwave") {
        rconsend("kill @e[type=!player]");
        nextwave();
    }
    if (readline === "killz") {
       rconsend("kill @e[type=!player]");
    }
    if (readline.startsWith("run")) {
        console.log(rconsend(readline.substring(4)));
    }
})