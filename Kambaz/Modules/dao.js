import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function ModulesDao(db) {
  async function findModulesForCourse(courseId) {
    const modules = await model.find({ course: courseId });
    return modules;
  }

  function createModule(module) {
    const newModule = { ...module, _id: uuidv4() };
    return model.create(newModule);
  }

  function deleteModule(moduleId) {
    return model.deleteOne({ _id: moduleId });
  }

  function updateModule(moduleId, moduleUpdates) {
    return model.updateOne({ _id: moduleId }, { $set: moduleUpdates });
  }

  return {
    findModulesForCourse,
    createModule,
    deleteModule,
    updateModule,
  };
}