import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, CBTAnalysisResponse } from "@/types";
import { getCBTAnalysis } from "@/lib/openai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface CBTJournalProps {
  user: User;
}

const cbtFormSchema = z.object({
  situation: z.string().min(5, "Please describe the situation in at least 5 characters"),
  emotion: z.string().min(2, "Please enter at least one emotion"),
  thought: z.string().min(5, "Please describe your thoughts in at least 5 characters"),
  challenge: z.string().optional(),
  reframe: z.string().optional(),
});

type CBTFormValues = z.infer<typeof cbtFormSchema>;

export default function CBTJournal({ user }: CBTJournalProps) {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<CBTAnalysisResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CBTFormValues>({
    resolver: zodResolver(cbtFormSchema),
    defaultValues: {
      situation: "",
      emotion: "",
      thought: "",
      challenge: "",
      reframe: "",
    },
  });
  
  // Create journal entry mutation
  const createJournalMutation = useMutation({
    mutationFn: async (values: CBTFormValues) => {
      const response = await apiRequest("POST", "/api/journal", {
        ...values,
        userId: user.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Journal entry saved",
        description: "Your thoughts have been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal", { userId: user.id }] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to save journal entry",
        description: "There was a problem saving your entry. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleNextStep = async () => {
    const currentStepFields: Record<number, (keyof CBTFormValues)[]> = {
      0: ["situation"],
      1: ["emotion"],
      2: ["thought"],
      3: ["challenge", "reframe"],
    };
    
    const fieldsToValidate = currentStepFields[currentStep];
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) return;
    
    if (currentStep === 2) {
      // Before moving to challenge/reframe step, get AI analysis
      try {
        setIsAnalyzing(true);
        const formValues = form.getValues();
        const analysis = await getCBTAnalysis(
          formValues.situation,
          formValues.emotion,
          formValues.thought
        );
        setAiAnalysis(analysis);
        
        // Pre-fill the challenge and reframe fields with AI suggestions
        form.setValue("challenge", analysis.challenge);
        form.setValue("reframe", analysis.reframe);
      } catch (error) {
        toast({
          title: "Analysis failed",
          description: "Could not analyze your thoughts. You can still proceed manually.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit the form
      onSubmit(form.getValues());
    }
  };
  
  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };
  
  const onSubmit = (values: CBTFormValues) => {
    createJournalMutation.mutate(values);
  };
  
  const resetForm = () => {
    form.reset();
    setCurrentStep(0);
    setAiAnalysis(null);
    setIsJournalOpen(false);
  };
  
  // Steps content
  const stepContent = [
    {
      title: "Describe the Situation",
      description: "What happened? What triggered your emotional response?",
      field: "situation" as const,
      placeholder: "I was preparing for a presentation at work when my boss asked to speak with me privately...",
    },
    {
      title: "Identify Your Emotions",
      description: "What were you feeling in that moment?",
      field: "emotion" as const,
      placeholder: "Anxious, worried, embarrassed",
    },
    {
      title: "Capture Your Thoughts",
      description: "What thoughts were going through your mind?",
      field: "thought" as const,
      placeholder: "I'm going to mess up the presentation and everyone will think I'm incompetent...",
    },
    {
      title: "Challenge & Reframe",
      description: "Let's examine your thoughts and find a more balanced perspective",
      fields: ["challenge" as const, "reframe" as const],
      placeholders: [
        "Is there evidence that contradicts my thought? Am I focusing on just the negatives?",
        "A more balanced thought might be...",
      ],
    },
  ];
  
  return (
    <>
      <Card 
        className="relative cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={() => setIsJournalOpen(true)}
      >
        <div className="h-32 -mx-px -mt-px mb-5 bg-cover bg-center rounded-t-xl" 
          style={{ backgroundImage: `url('https://pixabay.com/get/g78d4089f9d659389b4d6c42a99ee29839d28efa3abfd5f98b8a221e6333e14e61595c8d6d1182b996f5cc34e4661a297ec8604986bd53b781a333034860d62db_1280.jpg')` }}>
        </div>
        
        <CardContent>
          <h2 className="text-lg font-semibold flex items-center">
            <i className="ri-psychology-line mr-2 text-primary-500"></i>
            Thought Restructuring
          </h2>
          <p className="mt-2 text-gray-600 text-sm">Transform negative thoughts into balanced perspectives through guided CBT.</p>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary-100 p-1 rounded-full">
                <i className="ri-shield-star-line text-primary-600"></i>
              </div>
              <span className="ml-2 text-sm text-gray-700">AI-guided process</span>
            </div>
            <Button className="bg-primary-500 hover:bg-primary-600">
              Start <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isJournalOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CBT Thought Restructuring</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          <div className="py-2">
            <div className="flex justify-between text-sm mb-4">
              <div className="flex space-x-4">
                {stepContent.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index === currentStep 
                        ? "bg-primary-500 text-white" 
                        : index < currentStep 
                          ? "bg-primary-200 text-primary-700" 
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <span className="text-gray-500">Step {currentStep + 1} of {stepContent.length}</span>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {currentStep === 0 && (
                  <FormField
                    control={form.control}
                    name="situation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{stepContent[0].title}</FormLabel>
                        <p className="text-sm text-gray-500 mb-2">{stepContent[0].description}</p>
                        <FormControl>
                          <Textarea
                            placeholder={stepContent[0].placeholder}
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {currentStep === 1 && (
                  <FormField
                    control={form.control}
                    name="emotion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{stepContent[1].title}</FormLabel>
                        <p className="text-sm text-gray-500 mb-2">{stepContent[1].description}</p>
                        <FormControl>
                          <Input
                            placeholder={stepContent[1].placeholder}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {currentStep === 2 && (
                  <FormField
                    control={form.control}
                    name="thought"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{stepContent[2].title}</FormLabel>
                        <p className="text-sm text-gray-500 mb-2">{stepContent[2].description}</p>
                        <FormControl>
                          <Textarea
                            placeholder={stepContent[2].placeholder}
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {isAnalyzing ? (
                      <div className="text-center py-8">
                        <i className="ri-psychology-line text-primary-500 text-4xl animate-pulse"></i>
                        <p className="mt-4">Analyzing your thoughts...</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Our AI is examining your thought patterns and preparing suggestions.
                        </p>
                      </div>
                    ) : (
                      <>
                        {aiAnalysis && (
                          <div className="bg-primary-50 p-4 rounded-lg mb-4">
                            <h3 className="font-medium text-primary-900 flex items-center">
                              <i className="ri-robot-line mr-2"></i>
                              AI Analysis
                            </h3>
                            <p className="text-sm text-primary-800 mt-2">
                              <span className="font-medium">Thought Pattern:</span> {aiAnalysis.thoughtPattern}
                            </p>
                            <p className="text-sm text-primary-700 mt-1">
                              {aiAnalysis.patternExplanation}
                            </p>
                          </div>
                        )}
                        
                        <Tabs defaultValue="challenge">
                          <TabsList className="w-full">
                            <TabsTrigger value="challenge" className="w-1/2">Challenge</TabsTrigger>
                            <TabsTrigger value="reframe" className="w-1/2">Reframe</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="challenge">
                            <FormField
                              control={form.control}
                              name="challenge"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Challenge Your Thoughts</FormLabel>
                                  <p className="text-sm text-gray-500 mb-2">
                                    Question the evidence for your thoughts. Is there another way to look at this?
                                  </p>
                                  <FormControl>
                                    <Textarea
                                      placeholder={stepContent[3].placeholders[0]}
                                      rows={4}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>
                          
                          <TabsContent value="reframe">
                            <FormField
                              control={form.control}
                              name="reframe"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reframe Your Perspective</FormLabel>
                                  <p className="text-sm text-gray-500 mb-2">
                                    What's a more balanced or helpful way to think about this situation?
                                  </p>
                                  <FormControl>
                                    <Textarea
                                      placeholder={stepContent[3].placeholders[1]}
                                      rows={4}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>
                        </Tabs>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0 || isAnalyzing}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={isAnalyzing || createJournalMutation.isPending}
                  >
                    {createJournalMutation.isPending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Saving...
                      </>
                    ) : currentStep === stepContent.length - 1 ? (
                      "Save Journal"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
