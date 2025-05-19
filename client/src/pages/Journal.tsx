import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, JournalEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import CBTJournal from "@/components/CBTJournal";
import { format } from "date-fns";

interface JournalProps {
  user: User;
}

export default function Journal({ user }: JournalProps) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ["/api/journal", { userId: user.id }],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/journal?userId=${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch journal entries");
      }
      return response.json() as Promise<JournalEntry[]>;
    }
  });

  const openEntryDetail = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsEntryDialogOpen(true);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Thought Journal</h1>
        <p className="text-gray-600 mt-1">Track and restructure your thoughts with CBT techniques</p>
      </header>
      
      <Tabs defaultValue="entries">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="create">Create New Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries">
          {isLoading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-3xl text-primary-500"></i>
              <p className="text-gray-500 mt-4">Loading your journal entries...</p>
            </div>
          ) : !journalEntries || journalEntries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <i className="ri-book-2-line text-4xl text-gray-300"></i>
              <h3 className="text-xl font-medium text-gray-700 mt-4">No journal entries yet</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Start your CBT journey by creating your first thought journal entry.
              </p>
              <Button className="mt-6" onClick={() => document.getElementById("create-tab")?.click()}>
                Create Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries.map(entry => (
                <Card 
                  key={entry.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openEntryDetail(entry)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-primary-800 line-clamp-1">{entry.situation}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="bg-primary-100 px-2 py-1 rounded text-xs font-medium text-primary-700">
                        {entry.emotion}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">{entry.thought}</p>
                    
                    {entry.reframe && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                          <span className="font-medium not-italic">Reframe:</span> {entry.reframe}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create" id="create-tab">
          <CBTJournal user={user} />
        </TabsContent>
      </Tabs>
      
      {/* Entry Detail Dialog */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Journal Entry</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Situation</h3>
                <p className="mt-1">{selectedEntry.situation}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Emotion</h3>
                <div className="bg-primary-100 text-primary-800 inline-block px-3 py-1 rounded-full text-sm mt-1">
                  {selectedEntry.emotion}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Thought</h3>
                <p className="mt-1">{selectedEntry.thought}</p>
              </div>
              
              {selectedEntry.challenge && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Challenge</h3>
                  <p className="mt-1">{selectedEntry.challenge}</p>
                </div>
              )}
              
              {selectedEntry.reframe && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reframe</h3>
                  <p className="mt-1">{selectedEntry.reframe}</p>
                </div>
              )}
              
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Created on {format(new Date(selectedEntry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
