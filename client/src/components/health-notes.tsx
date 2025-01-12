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

const CATEGORIES = ["Diet Tips", "Next Visit Questions", "Test Results"] as const;

export default function HealthNotes() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  });

  const { notes, addNote } = useHealthNotes();
  const { toast } = useToast();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a category",
      });
      return;
    }

    if (!newNote.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required",
      });
      return;
    }

    if (!newNote.content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Content is required",
      });
      return;
    }

    try {
      await addNote({
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        category: selectedCategory,
      });

      setNewNote({ title: "", content: "" });
      setSelectedCategory(null);
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

  const categoryNotes = CATEGORIES.map((category) => ({
    category,
    notes: notes.filter((note) => note.category === category),
  }));

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
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={selectedCategory ?? undefined}
                  onValueChange={(value) => setSelectedCategory(value as Category)}
                >
                  <SelectTrigger>
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
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  placeholder="Enter a title for your note"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  placeholder="Write your note here..."
                  className="h-32"
                />
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
        {categoryNotes.map(({ category, notes: categoryNotes }) => (
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
                  {categoryNotes.map((note) => (
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
                  {categoryNotes.length === 0 && (
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