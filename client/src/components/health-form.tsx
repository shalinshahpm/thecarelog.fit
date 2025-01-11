import { useForm } from "react-hook-form";
import { useHealthMetrics } from "@/hooks/use-health-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  bloodSugar: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  cholesterol: number;
  medications: string;
  mealNotes: string;
  doctorNotes: string;
};

export default function HealthForm() {
  const { addMetric } = useHealthMetrics();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await addMetric(data);
      toast({
        title: "Success",
        description: "Health metrics saved successfully",
      });
      reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-lg font-medium">Blood Sugar (mg/dL)</label>
        <Input
          type="number"
          step="0.1"
          className="text-lg p-6"
          {...register("bloodSugar", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-lg font-medium">Blood Pressure (mmHg)</label>
        <div className="flex gap-4">
          <Input
            type="number"
            placeholder="Systolic"
            className="text-lg p-6"
            {...register("bloodPressureSystolic", { valueAsNumber: true })}
          />
          <Input
            type="number"
            placeholder="Diastolic"
            className="text-lg p-6"
            {...register("bloodPressureDiastolic", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-lg font-medium">Cholesterol (mg/dL)</label>
        <Input
          type="number"
          step="0.1"
          className="text-lg p-6"
          {...register("cholesterol", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-lg font-medium">Medications</label>
        <Textarea
          className="text-lg p-4"
          {...register("medications")}
          placeholder="List your medications..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-lg font-medium">Meal Notes</label>
        <Textarea
          className="text-lg p-4"
          {...register("mealNotes")}
          placeholder="What did you eat today?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-lg font-medium">Doctor Notes</label>
        <Textarea
          className="text-lg p-4"
          {...register("doctorNotes")}
          placeholder="Notes from your doctor visit..."
        />
      </div>

      <Button type="submit" className="w-full text-lg p-6">
        Save Health Metrics
      </Button>
    </form>
  );
}
