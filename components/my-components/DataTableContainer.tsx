import React from "react";
import DataTable from "@/components/my-components/DataTable";
import prisma from "@/lib/prisma";

export default async function DataTableContainer() {
  const data = await prisma.generatedCodes.findMany();
  return <DataTable data={data} />;
}
