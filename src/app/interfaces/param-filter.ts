import { yesNoType } from "./types-custom";

export interface ParamFilter {
  // determine if page or not page
  filter: yesNoType;
  page: number;
  size?: number;
  busqueda?: string;
  tipoProducto?: string;
  hasVariations?: string;
  hasStock?: string;
  documentType?: string;
  userStatus?: string;
  estadoAlquiler?: string;
  // formaPago?: FormaPago;
  fechaInicioComparar?: string;
  fechaFinComparar?: string;
  campoFechaComparar?: string;
}

export interface RetriveFilter {
  ide: string;
}
