"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Wrench, Sparkles } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content"

export default function ToolsPage() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  const handleNumber = (n: string) => {
    if (reset) { setDisplay(n); setReset(false); return; }
    setDisplay(display === "0" ? n : display + n);
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op) {
      const result = calculate(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setReset(true);
  };

  const calculate = (a: number, b: number, operator: string) => {
    switch (operator) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prev !== null && op) {
      const result = calculate(prev, parseFloat(display), op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setReset(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  return (
    <DashboardContent>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Tools</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5" /> Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 mb-3 text-right">
                <p className="text-xs text-muted-foreground h-4">
                  {prev !== null ? `${prev} ${op}` : ""}
                </p>
                <p className="text-3xl font-mono font-bold text-foreground truncate">{display}</p>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {buttons.flat().map((btn) => (
                  <Button
                    key={btn}
                    variant={
                      ["÷", "×", "-", "+", "="].includes(btn) ? "default" :
                      ["C", "±", "%"].includes(btn) ? "secondary" : "outline"
                    }
                    className={`h-12 text-lg font-medium ${btn === "0" ? "col-span-2" : ""}`}
                    onClick={() => {
                      if (btn === "C") handleClear();
                      else if (btn === "=") handleEquals();
                      else if (["+", "-", "×", "÷"].includes(btn)) handleOp(btn);
                      else if (btn === "±") setDisplay(String(-parseFloat(display)));
                      else if (btn === "%") setDisplay(String(parseFloat(display) / 100));
                      else handleNumber(btn);
                    }}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon */}
          <Card className="flex flex-col items-center justify-center min-h-[300px]">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">More Tools Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                We're working on adding more useful tools for students.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardContent>
  );
}
