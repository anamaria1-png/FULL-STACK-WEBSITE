const express = require("express");
const fs=require("fs");
obGlobal={
    obErori:null,
    obImagini:null,
}
const { dirname } = require("path");
const path=require('path');
const sharp=require('sharp');
app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1"]
for(let folder of vectorFoldere){
    let caleFolder=__dirname+"/"+folder;
    caleFolder
    if(! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"));

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
    var continut=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleAbs=path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(caleAbs,"mediu");
    if(!fs.existsSync(caleAbsMediu))
     fs.mkdirSync(caleAbsMediu);

    for(let imag of vImagini){
        [numeFis,ext]=imag.fisier.split(".")
       // eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
       let caleFisAbs=path.join(caleAbs,imag.fisier);
       let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
       sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
       imag.fisier_mediu="/"+path.join(obGlobal.obImagini.cale_galerie, numeFis+".webp")
       imag.fisier="/"+path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
       
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