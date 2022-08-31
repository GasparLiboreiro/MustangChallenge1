console.clear();
import express from "express";
import dotenv from "dotenv";
import request from "request-promise";
import cheerio from "cheerio";
import modeloEquipo from "./schema/equipo_schema.js";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import e from "express";

dotenv.config();

const PORT = process.env.PORT;
const TOUT = process.env.TOUT;
const server = express();



server.engine("hbs", engine({
    layoutsDir: "./views/layouts",
    defaultLayout: "index",
    extname: "hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
}));

server.set('view engine', 'hbs');

server.use(express.static("./public"));

server.get("/", async (req, res) => {
    let list = [];
    let cursor = modeloEquipo.find();
    (await cursor).forEach((e) => {
        list.push(e);
        var o = list.find((o) => o._id === e._id);
        if(o.rank<=4){
            o.ascender = true;
            o.descender = false;
        }
        else if(o.rank >= 25){
            o.ascender = false;
            o.descender = true;
        }
        else {
            o.ascender = false;
            o.descender = false;
        }
    })
    list.sort((a,b) => {
        return a.rank - b.rank;
    })
    
    res.render("./main.hbs", {lista: list});
});





function nextN(data, n){
    for(let x=0; x<n; x++)
        data=data.next();
    return data;
}



async function addEquipo(equipo){
    if(!equipo) throw new Error("no hay equipo");

    const res = await modeloEquipo.findOneAndUpdate({
        _id: equipo._id
    },{
        _id: equipo._id,
        rank: equipo.rank,
        img: equipo.img,
        pj: equipo.pj,
        g: equipo.g,
        e: equipo.e,
        p: equipo.p,
        gf: equipo.gf,
        gc: equipo.gc,
        dg: equipo.dg,
        pts: equipo.pts
    },{upsert: true})
}

const subirData = async () => {
    const $ = await request({
        uri: 'https://www.futbolargentino.com/primera-division/tabla-de-posiciones',
        transform: body => cheerio.load(body)
    });
    if(!$) throw new Error();
    for(let x=0; x<28; x++){
        let data = $("tr.clasificacion");
        data = nextN(data, x);

        const _id = data.find('span.d-md-none').html().trim();
        const img = data.find('td a img').attr('data-src');
        //console.log(img);
        data = data.find('td');
        const rank=data.html().trim();
        const pj = nextN(data,2).html().trim();
        const g  = nextN(data,3).html().trim();
        const e  = nextN(data,4).html().trim();
        const p  = nextN(data,5).html().trim();
        const gf = nextN(data,6).html().trim();
        const gc = nextN(data,7).html().trim();
        const dg = nextN(data,8).html().trim();
        const pts= nextN(data,9).html().trim();
        const equipo = {_id, img, rank, pj, g, e, p, gf, gc, dg, pts};
        //console.log(equipo);
        try{                                                                
            addEquipo(equipo);
        }
        catch(err){
            console.log(err.message,equipo);
        }
    }
    console.log("datos actualizados");
}

const a = async () => {
    await mongoose.connect(process.env.MONGODB_URL);                        mongoose

    try{
        setInterval(subirData, TOUT);
        //subirData();
    }
    catch(err){
        console.log(err);
    }
    if(!PORT) throw new Error("PORT indefinido");
    server.listen(PORT, (err) => {
        if(err)
            console.log("fuck");
        else{
            console.log(`Escuchando direccion http://localhost:${PORT}/`);
        }
    })
    
}

a();
