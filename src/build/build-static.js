/**
 * Build script
 * Copies resource files from node modules to dist
 *
 * */


let path = require("path");
let fs = require("fs-extra");
let utf8 = require("utf8");


console.log("Setting up output directories");
fs.ensureDirSync("dist");


console.log("Preparing manifest");
let npm_package = JSON.parse(fs.readFileSync("package.json").toString());
let manifest = fs.readFileSync(__dirname+"/configurations/manifest.json").toString();
let manifest_file = ['dist', 'manifest.json'].join(path.sep);
manifest = manifest.replace("_version_", npm_package['version']);
fs.writeFileSync(manifest_file, manifest);
//manifest for Firefox
let manifestfx = fs.readFileSync(__dirname+"/configurations/manifest-firefox.json").toString();
let manifestfx_file = ['dist', 'manifest-firefox.json'].join(path.sep);
manifestfx = manifestfx.replace("_version_", npm_package['version']);
fs.writeFileSync(manifestfx_file, manifestfx);


console.log("Reading bundle configuration files");
let dependencies_path = "./configurations/dependencies-";
let dependencies = {};
for (let type of ["development", "production", "background"]) {
    dependencies[type] = require(dependencies_path+type)
}

/** process an array of dependency declarations - copy files from one place to another **/
function build_static(dependencies_array) {
    dependencies_array.forEach(function(x) {
        let target = x["to"];
        // ensure target directory is present
        fs.ensureDirSync(path.dirname(target));
        // read contents of all the source files
        let result = x['from'].map(function(frompath) {
            if (frompath === "") {
                return "";
            }
            return utf8.encode(fs.readFileSync(frompath)+"\n");
        });
        fs.writeFileSync(target, result.join("\n"));
    })
}

let type = process.argv[2];

console.log("Building browser-side bundle")
build_static(dependencies["background"]);

if (type==="development" || type==="production") {
    console.log("Building client-side bundle ("+type+")");
    build_static(dependencies[type]);
} else {
    console.log("To build a bundle, specify either 'development' or 'production'")
}


if (type==='production') {
    console.log("Ensuring quiet execution in production mode");
    let background_file = ['dist','js', 'background.js'].join(path.sep);
    let background = fs.readFileSync(background_file);
    background += '\n\nverbose=false;\n';
    fs.writeFileSync(background_file, background);
}
