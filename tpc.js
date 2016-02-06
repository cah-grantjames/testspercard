var cliArgs = process.argv.slice(2);
var EXPECTED_ARGS = "tpc <project_key>"
    +"<start UNIX epoch OR 0 for all> "
    +"<end UNIX epoch OR 0 for all> ";
if(cliArgs && cliArgs[0] === "help") {
    console.log("\n\tEXPECTED ARGS:", EXPECTED_ARGS);
    console.log("\t\tRun from root of repo you're inquiring about\n");
    return;
}
if(!cliArgs || cliArgs.length != 3){
    console.log("Invalid ARGS!\n", EXPECTED_ARGS);
    return;
}
//
var runner = new Runner();
var fs = require('fs');
var projectKey = cliArgs[0];
var time = { start : cliArgs[1], end : cliArgs[2] };
var glimrBuild = require(__dirname+'/node_modules/glimr/glimr/glimr_build.js')();
var diffParser = require(__dirname+"/lib/diff_parser.js")();

var fullPathToRepo = cliArgs[0];

runner.run("git", ["log"], function(logs){
    var content = logs.toString();
    var startDate = new Date(time.start *1);
    var endDate = new Date(time.end*1);
    if(time.start == 0 && time.end == 0){
        startDate = undefined;
        endDate = undefined;
    }
    var logObjects = glimrBuild.toLogObjectsArray(content, startDate, endDate);
    var cardObjects = glimrBuild.cards.findUniqueCards(projectKey, logObjects);
    diffParser.findTestsForEachCard(cardObjects, function(cardObjectsWithTestsForEachCard){
        console.log(JSON.stringify(cardObjectsWithTestsForEachCard, 0, 4));
    });
});


function Runner() {
	this.isWin = /^win/.test(process.platform);
    this.child_process = require('child_process');
    this.runInherit = function(cmd, cmdArgs, cb) {

		if(this.isWin){
			if(cmd === "open"){
				cmd = "start";
			}
		}
        var msg = cmd;
        if(cmdArgs){
            for(var i=0; i<cmdArgs.length; i++) {
                msg += " "+cmdArgs[i];
            }
        }
        var spawn = this.child_process.spawn;
        spawn(cmd, cmdArgs, {stdio : 'inherit'});

        cb && cb();
    };

    this.run = function(cmd, cmdArgs, cb) {
		if(this.isWin){
			if(cmd === "open"){
				cmd = "start";
			}
		}
        var spawn = require('child_process').spawn,
        ls = spawn(cmd, cmdArgs);
        // console.log("RUNNING ", "[", cmd,  cmdArgs.join(" "), "]");
        var out = "";
        var error = false;
        ls.stdout.on('data', function (data) {
            out += "\n" + (data ? data.toString() : "");
        });
        ls.stderr.on('data', function (data) {
            error = true;
            out += "\n" + (data ? data.toString() : "");
        });

        ls.on('close', function (code) {
            cb && cb(out, error);
        });
    };
}