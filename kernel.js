const Rcon = require('modern-rcon');
var host = "192.168.178.29";
var rconpassword = "lel";
var rconport = 25575;

var wave = 0;
var maxzombies = 0;

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

function playsound(sound, player, volume, pitch = "1") {
    rconsend("playsound " + sound + " voice " + player + " ~ ~ ~ " + volume + " " + pitch);
}

function StartGame() {
    zombiespawnpoints = ["-1660 5 228", "-1640 5 236", "-1634 5 260"];
    wave ++;
    maxzombies = 10;
    playsound("wavestart", "@a", "999999")
    zombiesspawned = 0;
    sendtitle("@a", "Wave: " + wave, "red");
    var zombietimer = setInterval(function() { //ZombieSpawning
            rconsend("summon minecraft:zombie " + zombiespawnpoints[Math.floor(Math.random() * zombiespawnpoints.length)]);
            zombiesspawned ++;
            console.log("spawned: " + zombiesspawned + " max: " + maxzombies)
            if(zombiesspawned >= 10) {
                clearInterval(zombietimer);
                testforZombies();
            }
    }, 1000);
}

function nextwave() {
    wave ++;
    maxzombies = maxzombies * 2;
    sendtitle("@a", "Wave: " + wave, "red");
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
    if (readline === "nxtwave") {
        nextwave();
    }
    if (readline === "killz") {
       rconsend("kill @e[type=!player]");
    }
    if (readline.startsWith("run")) {
        console.log(rconsend(readline.substring(4)));
    }
})