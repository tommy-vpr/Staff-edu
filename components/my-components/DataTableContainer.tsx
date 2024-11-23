import React from "react";
import DataTable from "@/components/my-components/DataTable";
import prisma from "@/lib/prisma";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function DataTableContainer() {
  const data = await prisma.generatedCodes.findMany();
  return <DataTable data={data} />;
}
