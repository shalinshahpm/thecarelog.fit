import { useState } from "react";
import { useMedications } from "@/hooks/use-medications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Plus } from "lucide-react";

export default function MedicationTracker() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
  });
  const { medications, medicationLogs, addMedication, logMedication } =
    useMedications();
  const { toast } = useToast();

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMedication(newMedication);
      setNewMedication({ name: "", dosage: "", frequency: "", instructions: "" });
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleLogMedication = async (medicationId: number, status: "taken" | "skipped") => {
    try {
      await logMedication({
        medicationId,
        status,
        notes: "",
      });
      toast({
        title: "Success",
        description: `Medication marked as ${status}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Medications</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
            <CardDescription>
              Enter the details of your medication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMedication} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newMedication.name}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dosage</label>
                <Input
                  value={newMedication.dosage}
                  onChange={(e) =>
                    setNewMedication({ ...newMedication, dosage: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Input
                  value={newMedication.frequency}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      frequency: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Once daily, Twice daily"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <Input
                  value={newMedication.instructions}
                  onChange={(e) =>
                    setNewMedication({
                      ...newMedication,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="e.g., Take with food"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Medication</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div
                    key={medication.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {medication.dosage}
                        </p>
                        <p className="text-sm">{medication.frequency}</p>
                        {medication.instructions && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {medication.instructions}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() =>
                            handleLogMedication(medication.id, "taken")
                          }
                        >
                          <Check className="h-4 w-4" />
                          Taken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() =>
                            handleLogMedication(medication.id, "skipped")
                          }
                        >
                          <X className="h-4 w-4" />
                          Skip
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {medications.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No medications added yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {medicationLogs.map((log) => {
                  const medication = medications.find(
                    (m) => m.id === log.medicationId
                  );
                  return (
                    <div
                      key={log.id}
                      className="p-4 border rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {log.status === "taken" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {medication?.name || "Unknown"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.takenAt).toLocaleString()}
                      </p>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground">
                          Note: {log.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
                {medicationLogs.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No medication logs yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
