import mongoose from 'mongoose';

const equipoSchema = mongoose.Schema({
    _id: String,
    img: String,
    rank: Number,
    pj: Number,
    g: Number,
    e: Number,
    p: Number,
    gf: Number,
    gc: Number,
    dg: Number,
    pts: Number
});

const modeloEquipo = mongoose.model("Equipo", equipoSchema);

export default modeloEquipo;