import { createConfig } from "../../shared/rollup.config";

const pkg = require("./package.json");

export default createConfig(pkg);
