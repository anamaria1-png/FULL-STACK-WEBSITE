const express = require("express");
const fs=require("fs");
const { dirname } = require("path");
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');
const {Client} = require('pg');

 
var client= new Client({database:"site",
        user:"ana1",
        password:"parola",
        host:"localhost",
        port:5432});
client.connect();
client.query("select * from lab8", function(err, rez){
    console.log("Eroare BD",err);
 
    console.log("Rezultat BD",rez.rows);
});
const obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}
app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1","backup"]
for(let folder of vectorFoldere){
    let caleFolder=__dirname+"/"+folder;
    caleFolder
    if(! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        let vectorCale=caleScss.split("\\")
        let numeFisExt=vectorCale[vectorCale.length-1];

        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    
    // la acest punct avem cai absolute in caleScss si  caleCss
    let vectorCale=caleCss.split("\\");
    let numeFisCss=vectorCale[vectorCale.length-1];
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    console.log("Compilare SCSS",rez);
}
// compileazaScss("a.scss");

vFisiere=fs.readdirSync(obGlobal.folderScss);
console.log(vFisiere);
for(let numeFis of vFisiere){
    if(path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})
vFisiere=fs.readdirSync(obGlobal.folderScss);
for(let numeFis of vFisiere){
    if(path.extname(numeFis)==".scss")
    compileazaScss(numeFis);
}


app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"));
app.use("/node_modules",express.static(__dirname+"/node_modules"))
app.use(/^\/resurse(\/[a-zA-Z0-9]+)*\/?$/, function(req, res){
    console.log("123");
    afisareEroare(res,403);
});

app.get("/favicon.ico", function (req,res){
    res.sendFile(_dirname+"resurse/imagini/favicon.ico");
})
app.get("/ceva", function(req, res){
    res.send("<h1>altceva<h1> ip:" +req.ip);
})

app.get(["/index","/","home"], function(req, res){
    res.render("pagini/index", {Ip: req.ip, a: 10 , b: 20,imagini:obGlobal.obImagini.imagini});
})

app.get("/*.ejs", function (req,res){
    afisareEroare(res,400);
})

app.get("/*", function(req,res){
    try{
    res.render("pagini"+req.url,function(err,rezRandare){
        if(err)
        {
        if(err.message.startsWith("Failed to look up view"))
        afisareEroare(res,404)
        else
        afisareEroare(res)
        }
    else res.send(rezRandare)
    }
    );
}catch(err){
    if(err)
        {
        if(err.message.startsWith("Cannot find mdule"))
        afisareEroare(res,404)
        else
        afisareEroare(res)
        }
    else res.send(rezRandare)
    }

})
function initErori()
{
    var continut=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    for(let eroare of vErori){
        eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initErori();

function initImagini()
{
    /*const continut=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini=JSON.parse(continut);
    
    for(let imag of obGlobal.obImagini.imagini){
        let numeImagine;
        [numeImagine, ] = imag.cale_fisier.split(".");
       eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
       let caleFisAbs=path.join(caleAbs,imag.fisier);
       let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
       sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
       imag.fisier_mediu="/"+path.join(obGlobal.obImagini.cale_galerie, numeFis+".webp")
       imag.fisier="/"+path.join(obGlobal.obImagini.cale_galerie, imag.fisier);*/

    const buf = fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");
    obGlobal.obImagini = JSON.parse(buf);
    for(let imag of obGlobal.obImagini.imagini) {
        console.log("aici");
        let nume_imag;
        [nume_imag, ] = imag.cale_fisier.split(".");
        let dim_mic = 150;
        imag.mic = `${obGlobal.obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`;
        imag.mare = `${obGlobal.obImagini.cale_galerie}/${imag.cale_fisier}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/" + imag.mare).resize(dim_mic).toFile(__dirname + "/" + imag.mic);
        let dim_mediu = 300;
        imag.mediu = `${obGlobal.obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png`;
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname + "/" + imag.mare).resize(dim_mediu).toFile(__dirname + "/" + imag.mediu);
    }
       
    }

initImagini();
function afisareEroare(res,_identificator,_titlu,_text,_imagine){
    let vErori=obGlobal.obErori.info_erori;
    let eroare=vErori.find(function(elem){return elem.identificator==_identificator;})
    if(eroare){
        let titlu1= _titlu||eroare.titlu;
        let text1=_text||eroare.text;
        let imagine1=_imagine||eroare.imagine;
        if(eroare.status)
        {
            res.status(eroare.identificator).render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});

        }
        else
            res.render("pagini/eroare",{titlu:titlu1, text:text1, imagine:imagine1});
    }
    else{let errDef=obGlobal.obErori.eroare_default;
         res.render("pagini/eroare",{titlu:errDef.titlu, text:errDef.text, imagine:errDef.imagine});
    }
       

}
app.listen(8080);
console.log("Serverul a pornit");