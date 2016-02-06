module.exports = function() {

    var DIFF = { diffFullContextCmdArgs : ["diff", "--no-prefix", "-U1000"] };
    DIFF.runner = new Runner();

    DIFF.findTestsForEachCard = function(cardObjects) {
        for(var i=0; i<cardObjects.length; i++){
            var cmdArgs = DIF.getDiffCommandArgs(cardObjects[i]);
            runner.run("git", cmdArgs, function(response) {
                console.log(response);
            });
        }
        return cardObjects;
    };

    DIFF.findTests = function(diffString){
        var lines = diffString.split("\n");
        var files = [];
        var currentFileIndex = -1;
        var currentTestIndex = -1;
        var curlyCounter = 0;
        for(var i=0; i<lines.length; i++){
            var line = lines[i].trim();
            if(line.length>0) {
                if(line.indexOf("diff --git") != -1) {
                    //this a file
                    var fileName = line.replace("diff --git", "").trim();
                    files.push({ name : fileName, tests : []});
                    currentFileIndex = files.length - 1;
                    curlyCounter = 0;
                } else if(currentFileIndex != -1) {
                    //In context of a file
                    if(line.indexOf("@Test") === 0) {
                        var test = { wasModified : false };
                        curlyCounter = 0;
                        files[currentFileIndex].tests.push(test);
                        currentTestIndex = files[currentFileIndex].tests.length - 1;
                    } else if(currentTestIndex != -1) {
                        //while in the context of a test in a file
                        curlyCounter += DIFF.countOpenCurliesOnLine(line);
                        curlyCounter -= DIFF.countCloseCurliesOnLine(line);
                        if(line.indexOf("public void ") != -1){
                            if(line.indexOf("-") != 0) {
                                var testName = DIFF.getTestNameFromLine(line);
                                files[currentFileIndex].tests[currentTestIndex].name = testName;
                            }
                        }
                        if(line.indexOf("-") == 0 || line.indexOf("+") == 0) {
                            if(line.length > 1){
                                files[currentFileIndex].tests[currentTestIndex].wasModified = true;
                            }
                        }
                        if(curlyCounter === 0) {
                            //test ended
                            currentTestIndex = -1;
                        }
                    }
                }
            }
        }
        return files;
    };

    DIFF.getDiffCommandArgs = function(cardObject) {
        var lastCommit = cardObject.commits[cardObject.commits.length-1].commit;
        var firstCommit = cardObject.commits[0].commit;
        var cmdArgs = DIFF.diffFullContextCmdArgs;
        cmdArgs.push(lastCommit)
        cmdArgs.push(firstCommit);
        return cmdArgs;
    };

    DIFF.getTestNameFromLine = function(line){
        var name = line.replace("\t", "");
        name = name.substr(name.indexOf("void")+4);
        name = name.substr(0, name.indexOf("(")).trim();
        return name;
    };

    DIFF.countOpenCurliesOnLine = function(str){
        return (str.match(/{/g) || []).length;
    };

    DIFF.countCloseCurliesOnLine = function(str){
        return (str.match(/}/g) || []).length;
    };

    return DIFF;
}

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


