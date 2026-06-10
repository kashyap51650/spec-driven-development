import React from "react";
import type { Income } from "@/types/income";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditIncomeButton from "./EditIncomeButton";
import DeleteIncomeButton from "./DeleteIncomeButton";

export default function IncomeTable({ incomes }: { incomes: Income[] }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomes.map((i) => (
            <TableRow key={i.id}>
              <TableCell>{formatDate(new Date(i.date))}</TableCell>
              <TableCell>{i.title}</TableCell>
              <TableCell>
                <Badge>{i.source}</Badge>
              </TableCell>
              <TableCell>{i.account}</TableCell>
              <TableCell className="text-green-600">
                {formatCurrency(i.amount)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <EditIncomeButton income={i} />
                  <DeleteIncomeButton id={i.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
