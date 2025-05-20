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
        className="relative cursor-pointer shadow-soft hover:shadow-md transition-all duration-300 overflow-hidden bg-calm-gradient"
        onClick={() => setIsJournalOpen(true)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mt-10 -mr-10 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -mb-8 -ml-8 z-0"></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-4">
            <i className="ri-psychology-line text-primary text-2xl"></i>
          </div>
          
          <h2 className="text-xl font-medium flex items-center mb-3">
            Restructuration des pensées
          </h2>
          
          <p className="text-muted-foreground">
            Transformez vos pensées négatives en perspectives équilibrées grâce à un processus guidé par l'IA.
          </p>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-accent/10 p-1.5 rounded-full">
                <i className="ri-shield-star-line text-accent"></i>
              </div>
              <span className="ml-2 text-sm">Processus guidé par IA</span>
            </div>
            
            <Button className="btn-glow">
              Commencer <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isJournalOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl">Restructuration des pensées</DialogTitle>
            <p className="text-muted-foreground text-sm mt-1">Une approche guidée pour transformer vos pensées négatives</p>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          <div className="py-2">
            <div className="flex justify-between items-center mb-6 mt-2">
              <div className="flex-1 relative">
                <div className="absolute h-1 bg-muted rounded-full w-full top-1/2 transform -translate-y-1/2"></div>
                <div className="flex justify-between relative z-10">
                  {stepContent.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          index === currentStep 
                            ? "bg-primary text-primary-foreground shadow-md scale-110" 
                            : index < currentStep 
                              ? "bg-primary/60 text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < currentStep ? <i className="ri-check-line"></i> : (index + 1)}
                      </div>
                      <span className={`text-xs mt-2 transition-all ${index === currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {step.title.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <i className="ri-map-pin-line text-primary"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-foreground">{stepContent[0].title}</h3>
                        <p className="text-sm text-muted-foreground">{stepContent[0].description}</p>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="situation"
                      render={({ field }) => (
                        <FormItem className="mt-4 bg-card rounded-xl p-4 border border-border shadow-sm">
                          <FormControl>
                            <Textarea
                              placeholder={stepContent[0].placeholder}
                              rows={5}
                              className="border-none shadow-none focus-visible:ring-0 bg-transparent resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                      <div className="flex items-start text-sm">
                        <i className="ri-lightbulb-line text-amber-500 mt-0.5 mr-2"></i>
                        <p className="text-muted-foreground">
                          Décrivez brièvement ce qui s'est passé, où vous étiez et ce que vous faisiez quand vous avez ressenti une émotion ou une pensée négative.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <i className="ri-emotion-line text-primary"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-foreground">{stepContent[1].title}</h3>
                        <p className="text-sm text-muted-foreground">{stepContent[1].description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-card rounded-xl p-5 border border-border shadow-sm">
                      <p className="mb-3 text-sm font-medium">Émotions fréquentes :</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["Anxiété", "Tristesse", "Colère", "Frustration", "Honte", "Culpabilité", "Inquiétude"].map(emotion => (
                          <button
                            key={emotion}
                            type="button"
                            className="px-3 py-1.5 rounded-full border border-border bg-background hover:bg-primary/5 transition-colors"
                            onClick={() => {
                              const currentValue = form.getValues("emotion");
                              const newValue = currentValue ? `${currentValue}, ${emotion}` : emotion;
                              form.setValue("emotion", newValue);
                            }}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="emotion"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input
                                placeholder={stepContent[1].placeholder}
                                className="border-primary/20 focus-visible:ring-primary/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                      <div className="flex items-start text-sm">
                        <i className="ri-information-line text-primary mt-0.5 mr-2"></i>
                        <p className="text-muted-foreground">
                          Nommer vos émotions précisément vous aide à mieux comprendre vos réactions et à gagner en clarté sur votre situation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <i className="ri-brain-line text-primary"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-foreground">{stepContent[2].title}</h3>
                        <p className="text-sm text-muted-foreground">{stepContent[2].description}</p>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="thought"
                      render={({ field }) => (
                        <FormItem className="mt-4 bg-card rounded-xl p-4 border border-border shadow-sm">
                          <FormControl>
                            <Textarea
                              placeholder={stepContent[2].placeholder}
                              rows={5}
                              className="border-none shadow-none focus-visible:ring-0 bg-transparent resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                      <div className="flex items-start text-sm">
                        <i className="ri-lightbulb-line text-amber-500 mt-0.5 mr-2"></i>
                        <p className="text-muted-foreground">
                          Essayez de capturer vos pensées telles qu'elles vous sont venues, sans les juger. Notre IA analysera les schémas de pensée pour vous aider à les transformer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {isAnalyzing ? (
                      <div className="text-center py-10 px-4">
                        <div className="w-20 h-20 rounded-full mx-auto bg-primary/10 flex items-center justify-center mb-4 animate-breath">
                          <i className="ri-psychology-line text-primary text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-medium mb-3">Analyse en cours...</h3>
                        <p className="text-muted-foreground">
                          Notre IA examine vos schémas de pensée et prépare des suggestions personnalisées.
                        </p>
                        <div className="mt-8 h-1.5 bg-muted rounded-full w-3/4 mx-auto overflow-hidden">
                          <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <i className="ri-refresh-line text-primary"></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-foreground">{stepContent[3].title}</h3>
                            <p className="text-sm text-muted-foreground">{stepContent[3].description}</p>
                          </div>
                        </div>
                        
                        {aiAnalysis && (
                          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl mb-4 border border-primary/10 shadow-sm">
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                                <i className="ri-robot-line text-primary"></i>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">Analyse IA</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Voici ce que j'ai détecté dans votre pensée.
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 ml-11">
                              <div className="bg-card rounded-lg p-3 border border-border mb-3">
                                <p className="text-sm font-medium">Schéma de pensée détecté:</p>
                                <p className="text-primary mt-1 font-medium">{aiAnalysis.thoughtPattern}</p>
                              </div>
                              
                              <p className="text-sm mb-4">
                                {aiAnalysis.patternExplanation}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <Tabs defaultValue="challenge" className="bg-card rounded-xl p-1 border border-border">
                          <TabsList className="w-full bg-muted/50 p-1 rounded-lg mb-4">
                            <TabsTrigger value="challenge" className="w-1/2 rounded-md py-2 data-[state=active]:bg-card">
                              <i className="ri-question-line mr-1.5"></i> Remise en question
                            </TabsTrigger>
                            <TabsTrigger value="reframe" className="w-1/2 rounded-md py-2 data-[state=active]:bg-card">
                              <i className="ri-refresh-line mr-1.5"></i> Reformulation
                            </TabsTrigger>
                          </TabsList>
                          
                          <div className="px-4 pb-4">
                            <TabsContent value="challenge" className="mt-0">
                              <FormField
                                control={form.control}
                                name="challenge"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex justify-between items-center mb-2">
                                      <FormLabel className="text-base">Remettez en question vos pensées</FormLabel>
                                      {aiAnalysis && (
                                        <button 
                                          type="button"
                                          className="text-xs text-primary hover:underline"
                                          onClick={() => field.onChange(aiAnalysis.challenge)}
                                        >
                                          Utiliser la suggestion
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Questionnez les preuves qui soutiennent vos pensées. Y a-t-il une autre façon de voir la situation?
                                    </p>
                                    <FormControl>
                                      <Textarea
                                        placeholder={stepContent[3]?.placeholders?.[0] || "Quelles preuves contredisent cette pensée? Est-ce que je me concentre uniquement sur le négatif?"}
                                        rows={4}
                                        className="bg-muted/30 border-muted focus-visible:border-primary/30 resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TabsContent>
                            
                            <TabsContent value="reframe" className="mt-0">
                              <FormField
                                control={form.control}
                                name="reframe"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex justify-between items-center mb-2">
                                      <FormLabel className="text-base">Reformulez votre perspective</FormLabel>
                                      {aiAnalysis && (
                                        <button 
                                          type="button"
                                          className="text-xs text-primary hover:underline"
                                          onClick={() => field.onChange(aiAnalysis.reframe)}
                                        >
                                          Utiliser la suggestion
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Quelle serait une façon plus équilibrée ou utile de penser à cette situation?
                                    </p>
                                    <FormControl>
                                      <Textarea
                                        placeholder={stepContent[3]?.placeholders?.[1] || "Une pensée plus équilibrée pourrait être..."}
                                        rows={4}
                                        className="bg-muted/30 border-muted focus-visible:border-primary/30 resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TabsContent>
                          </div>
                        </Tabs>
                        
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <div className="flex items-start text-sm">
                            <i className="ri-information-line text-primary mt-0.5 mr-2"></i>
                            <p className="text-muted-foreground">
                              La reformulation n'est pas simplement positive, elle est <span className="font-medium">réaliste</span>. Elle reconnaît les difficultés tout en intégrant les perspectives plus équilibrées.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0 || isAnalyzing}
                    className="px-5"
                  >
                    <i className="ri-arrow-left-line mr-1.5"></i>
                    Précédent
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={isAnalyzing || createJournalMutation.isPending}
                    className="px-5"
                  >
                    {createJournalMutation.isPending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-1.5"></i>
                        Enregistrement...
                      </>
                    ) : currentStep === stepContent.length - 1 ? (
                      <>Enregistrer l'entrée <i className="ri-check-line ml-1"></i></>
                    
                    ) : (
                      <>Continuer <i className="ri-arrow-right-line ml-1.5"></i></>
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
