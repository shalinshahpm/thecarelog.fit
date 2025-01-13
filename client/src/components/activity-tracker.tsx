
import { useState } from "react";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ActivityTracker() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "",
    value: "",
    duration: "",
    intensity: "moderate",
  });
  
  const { logs, addLog } = useActivityLogs();
  const { toast } = useToast();

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLog({
        type: newActivity.type,
        value: Number(newActivity.value),
        duration: Number(newActivity.duration),
        intensity: newActivity.intensity,
      });
      setNewActivity({ type: "", value: "", duration: "", intensity: "moderate" });
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Activity logged successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Tracker</CardTitle>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleAddActivity} className="space-y-4 mb-6">
            <Select
              value={newActivity.type}
              onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="cycling">Cycling</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={newActivity.duration}
              onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
            />

            <div className="space-y-2">
              <Label>Intensity Level</Label>
              <RadioGroup
                value={newActivity.intensity}
                onValueChange={(value) => setNewActivity({ ...newActivity, intensity: value })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vigorous" id="vigorous" />
                  <Label htmlFor="vigorous">Vigorous</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit">Save Activity</Button>
          </form>
        )}

        <ScrollArea className="h-[400px]">
          {Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div key={date} className="mb-4">
              <h3 className="font-semibold mb-2">{date}</h3>
              <div className="space-y-2">
                {dayLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{log.type}</span>
                      <span>{log.duration} minutes</span>
                    </div>
                    {log.intensity && (
                      <div className="text-sm text-muted-foreground capitalize">
                        Intensity: {log.intensity}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
