import { UserRound } from "lucide-react";
import type { ResourceConfig } from "./types";

const FUCSIA = "#e6007e";
const AZUL = "#0091d5";

export const pacientes: ResourceConfig = {
  key: "pacientes",
  path: "/archivos/pacientes",
  singular: "Paciente",
  plural: "Pacientes",
  article: "el",
  icon: UserRound,
  description: "Registro de pacientes atendidos en los consultorios.",
  searchKeys: ["nombres", "apellidos", "numDoc", "email", "telefono"],
  titleKey: "_nombre",
  subtitleKey: "numDoc",
  derive: (r) => ({ _nombre: `${r.nombres ?? ""} ${r.apellidos ?? ""}`.trim() }),
  columns: [
    { key: "_nombre", header: "Paciente", type: "primary", subKey: "numDoc" },
    { key: "telefono", header: "Teléfono", hideOnMobile: true },
    { key: "email", header: "Correo", hideOnMobile: true },
    { key: "ocupacion", header: "Ocupación", hideOnMobile: true },
    {
      key: "sexo",
      header: "Sexo",
      type: "badge",
      colorMap: { Femenino: FUCSIA, Masculino: AZUL },
    },
  ],
  fields: [
    { name: "nombres", label: "Nombres", type: "uppercase", required: true, span: 1 },
    { name: "apellidos", label: "Apellidos", type: "uppercase", required: true, span: 1 },
    {
      name: "tipoDoc",
      label: "Tipo de documento",
      type: "select",
      required: true,
      span: 1,
      options: ["DNI", "CE", "PTP", "Pasaporte", "CPP", "Otro"].map((v) => ({ value: v, label: v })),
    },
    { name: "numDoc", label: "N° de documento", type: "text", required: true, span: 1 },
    { name: "fechaNacimiento", label: "Fecha de nacimiento", type: "date", span: 1 },
    {
      name: "sexo",
      label: "Sexo",
      type: "select",
      required: true,
      span: 1,
      options: [
        { value: "Femenino", label: "Femenino" },
        { value: "Masculino", label: "Masculino" },
      ],
    },
    { name: "telefono", label: "Teléfono", type: "tel", span: 1 },
    { name: "email", label: "Correo electrónico", type: "email", span: 1 },
    { name: "ocupacion", label: "Ocupación", type: "uppercase", span: 1 },
    {
      name: "estadoCivil",
      label: "Estado civil",
      type: "select",
      span: 1,
      options: ["Soltero(a)", "Casado(a)", "Conviviente", "Divorciado(a)", "Viudo(a)"].map((v) => ({ value: v, label: v })),
    },
    { name: "direccion", label: "Dirección", type: "uppercase", span: 2 },
  ],
  seed: [
    { id: 1, nombres: "María Elena", apellidos: "Flores Quispe", tipoDoc: "DNI", numDoc: "70215488", fechaNacimiento: "1992-04-18", sexo: "Femenino", telefono: "987654321", email: "maria.flores@gmail.com", ocupacion: "Docente", estadoCivil: "Casado(a)", direccion: "Av. Los Próceres 234, San Juan" },
    { id: 2, nombres: "Carlos Alberto", apellidos: "Ramos León", tipoDoc: "DNI", numDoc: "45821190", fechaNacimiento: "1985-11-02", sexo: "Masculino", telefono: "961203847", email: "cramos@hotmail.com", ocupacion: "Ingeniero", estadoCivil: "Soltero(a)", direccion: "Jr. Amazonas 891" },
    { id: 3, nombres: "Lucía", apellidos: "Huamán Torres", tipoDoc: "DNI", numDoc: "73910022", fechaNacimiento: "1998-07-25", sexo: "Femenino", telefono: "934118827", email: "lucia.huaman@gmail.com", ocupacion: "Estudiante", estadoCivil: "Soltero(a)", direccion: "Calle Las Gardenias 12" },
    { id: 4, nombres: "Rosa María", apellidos: "Cárdenas Vega", tipoDoc: "CE", numDoc: "002841558", fechaNacimiento: "1979-01-30", sexo: "Femenino", telefono: "920458112", email: "rosa.cardenas@gmail.com", ocupacion: "Comerciante", estadoCivil: "Conviviente", direccion: "Av. Grau 1450" },
    { id: 5, nombres: "Jorge Luis", apellidos: "Mendoza Ríos", tipoDoc: "DNI", numDoc: "41209873", fechaNacimiento: "1990-09-14", sexo: "Masculino", telefono: "955302118", email: "jmendoza@gmail.com", ocupacion: "Chofer", estadoCivil: "Casado(a)", direccion: "Jr. Tacna 320" },
    { id: 6, nombres: "Ana Paula", apellidos: "Salazar Núñez", tipoDoc: "DNI", numDoc: "76554321", fechaNacimiento: "2001-03-08", sexo: "Femenino", telefono: "913882044", email: "anapaula.s@gmail.com", ocupacion: "Diseñadora", estadoCivil: "Soltero(a)", direccion: "Urb. Santa Rosa Mz. C Lt. 8" },
    { id: 7, nombres: "Pedro", apellidos: "Quispe Mamani", tipoDoc: "DNI", numDoc: "48771203", fechaNacimiento: "1975-12-19", sexo: "Masculino", telefono: "942110385", email: "pedro.quispe@gmail.com", ocupacion: "Agricultor", estadoCivil: "Viudo(a)", direccion: "Av. Circunvalación 77" },
    { id: 8, nombres: "Carmen Rosa", apellidos: "Díaz Paredes", tipoDoc: "DNI", numDoc: "70019988", fechaNacimiento: "1995-06-11", sexo: "Femenino", telefono: "938201577", email: "carmen.diaz@gmail.com", ocupacion: "Enfermera", estadoCivil: "Soltero(a)", direccion: "Calle Bolognesi 540" },
  ],
};
