import mongoose from "mongoose";

const schema = new mongoose.Schema({
  _id: String,
  name: String,
  description: String,
  course: String,
  lessons: [
    {
      _id: String,
      name: String,
      description: String,
      module: String,
    },
  ],
},
    { collection : "modules" }
);

export default schema;