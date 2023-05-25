import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { paths } from "./api";

const APIDocs = () => <SwaggerUI url={`${paths.docs}`} />;

export default APIDocs;