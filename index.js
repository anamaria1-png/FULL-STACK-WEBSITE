const express = require("express");
const fs=require("fs");
obGlobal={
    obErori:null,
    obImagini:null,
}
const { dirname } = require("path");

app= express();
console.log("Folder proiect", __dirname);

app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"));

app.get("/ceva", function(req, res){
    res.send("<h1>altceva<h1>");
})

app.get(["/index","/","home"], function(req, res){
    res.render("pagini/index", {Ip: req.ip});
})

app.get("/*", function(req,res){
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
function afisareEroare(res,_identificator,_titlu,_text,_text){
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