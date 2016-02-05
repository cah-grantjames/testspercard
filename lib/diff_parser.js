module.exports = function() {
    var DIFF = {};

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

//else if(line.indexOf("+") != -1 || line.indexOf("-") != -1){
////this is a line change
//line = "<div class='diffLineAddition'>" + line + "</div>";
//} else if(){
//line = "<div class='diffLineSubtraction'>" + line + "</div>";
//} else {
//line = "<div class='diffOther'>" + line + "</div>";
//}