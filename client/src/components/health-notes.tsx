import { useState } from "react";
import { useHealthNotes } from "@/hooks/use-health-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, FileText } from "lucide-react";
import type { Category } from "@/lib/types";

const CATEGORIES: Category[] = ["Diet Tips", "Next Visit Questions", "Test Results"];

export default function HealthNotes() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { notes, addNote } = useHealthNotes();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedCategory) {
      errors.category = "Category is required";
    }
    if (!newNote.title.trim()) {
      errors.title = "Title is required";
    }
    if (!newNote.content.trim()) {
      errors.content = "Content is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (!selectedCategory) {
      return; // This should never happen due to validateForm
    }

    try {
      const noteData = {
        category: selectedCategory,
        title: newNote.title.trim(),
        content: newNote.content.trim(),
      };

      await addNote(noteData);

      setNewNote({ title: "", content: "" });
      setSelectedCategory(null);
      setFormErrors({});
      setShowAddForm(false);

      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add note",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Health Notes</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
            <CardDescription>
              Record important health information or questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedCategory ?? undefined}
                  onValueChange={(value: Category) => {
                    setSelectedCategory(value);
                    setFormErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <SelectTrigger className={formErrors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newNote.title}
                  onChange={(e) => {
                    setNewNote({ ...newNote, title: e.target.value });
                    setFormErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => {
                    setNewNote({ ...newNote, content: e.target.value });
                    setFormErrors((prev) => ({ ...prev, content: "" }));
                  }}
                  className={`h-32 ${formErrors.content ? "border-red-500" : ""}`}
                />
                {formErrors.content && (
                  <p className="text-sm text-red-500">{formErrors.content}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Note</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNote({ title: "", content: "" });
                    setSelectedCategory(null);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {notes
                    .filter((note) => note.category === category)
                    .map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{note.title}</h3>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "Edit functionality will be added soon",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    ))}
                  {notes.filter((note) => note.category === category).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No notes in this category
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}