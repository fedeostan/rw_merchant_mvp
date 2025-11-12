import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PropData {
  prop: string;
  type: string;
  required?: boolean;
  description: string;
}

interface PropsTableProps {
  data: PropData[];
}

export function PropsTable({ data }: PropsTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="font-semibold">Prop</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Required</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-xs text-purple-600">
                {item.prop}
              </TableCell>
              <TableCell className="font-mono text-xs text-foreground">
                {item.type}
              </TableCell>
              <TableCell>
                {item.required !== undefined ? (
                  item.required ? (
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">No</span>
                  )
                ) : null}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
