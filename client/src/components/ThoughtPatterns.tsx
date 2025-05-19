import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThoughtPattern } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function ThoughtPatterns() {
  const [selectedPattern, setSelectedPattern] = useState<ThoughtPattern | null>(null);
  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch all thought patterns
  const { data: patterns, isLoading } = useQuery({
    queryKey: ["/api/thought-patterns"],
    queryFn: async () => {
      const response = await fetch("/api/thought-patterns", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch thought patterns");
      }
      return response.json() as Promise<ThoughtPattern[]>;
    }
  });
  
  const openPatternDetail = (pattern: ThoughtPattern) => {
    setSelectedPattern(pattern);
    setIsPatternDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <i className="ri-book-read-line mr-2 text-primary-500"></i>
          Thought Patterns Library
        </CardTitle>
        <CardDescription>
          Learn to identify unhelpful thought patterns and how to challenge them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <i className="ri-loader-4-line animate-spin text-2xl text-primary-500"></i>
            <p className="text-sm text-gray-500 mt-2">Loading thought patterns...</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5" ref={scrollContainerRef}>
            <div className="flex space-x-4 pb-2">
              {patterns?.map((pattern) => (
                <div 
                  key={pattern.id}
                  className="bg-primary-50 rounded-lg p-3 flex-shrink-0 cursor-pointer hover:bg-primary-100"
                  style={{ width: "220px" }}
                  onClick={() => openPatternDetail(pattern)}
                >
                  <h3 className="text-sm font-medium text-primary-900">{pattern.name}</h3>
                  <p className="text-xs text-primary-700 mt-1">{pattern.description}</p>
                  <button className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium">
                    Learn more
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Thought Pattern Detail Dialog */}
      <Dialog open={isPatternDialogOpen} onOpenChange={setIsPatternDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedPattern?.name}</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          {selectedPattern && (
            <div className="space-y-4 py-2">
              <div>
                <h3 className="text-sm font-medium text-gray-700">What is it?</h3>
                <p className="mt-1 text-sm text-gray-600">{selectedPattern.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Examples</h3>
                <ul className="mt-1 space-y-1 text-sm text-gray-600 list-disc pl-5">
                  {selectedPattern.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">How to reframe it</h3>
                <ul className="mt-1 space-y-1 text-sm text-gray-600 list-disc pl-5">
                  {selectedPattern.reframeStrategies.map((strategy, index) => (
                    <li key={index}>{strategy}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Next time you notice this pattern, try using one of these reframing strategies.
                </p>
                <Button 
                  variant="outline" 
                  className="text-primary-600 border-primary-300 hover:bg-primary-50"
                  onClick={() => setIsPatternDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
