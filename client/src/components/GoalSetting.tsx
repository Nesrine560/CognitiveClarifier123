import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getCBTAnalysis } from "@/lib/openai";

interface GoalSettingProps {
  user: User;
}

const goalFormSchema = z.object({
  title: z.string().min(3, {
    message: "Le titre de l'objectif doit comporter au moins 3 caractères",
  }),
  description: z.string().min(10, {
    message: "La description doit comporter au moins 10 caractères",
  }),
  deadline: z.date({
    required_error: "Veuillez sélectionner une date limite",
  }),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  plan?: GoalPlan;
  completed: boolean;
  createdAt: Date;
}

interface GoalPlan {
  steps: GoalStep[];
  tips: string[];
  estimatedCompletion: string;
}

interface GoalStep {
  id: string;
  description: string;
  completed: boolean;
  targetDate?: Date;
}

export default function GoalSetting({ user }: GoalSettingProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: addDays(new Date(), 30), // 30 jours par défaut
    },
  });
  
  const onSubmit = async (values: GoalFormValues) => {
    // Simuler l'ajout d'un nouvel objectif
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: values.title,
      description: values.description,
      deadline: values.deadline,
      completed: false,
      createdAt: new Date(),
    };
    
    setGoals(prev => [...prev, newGoal]);
    form.reset();
    
    // Générer un plan d'action pour l'objectif
    await generateGoalPlan(newGoal);
  };
  
  const generateGoalPlan = async (goal: Goal) => {
    setSelectedGoal(goal);
    setIsGeneratingPlan(true);
    setIsDialogOpen(true);
    
    try {
      // Dans une véritable implémentation, ceci appellerait l'API OpenAI
      // Pour cet exemple, nous simulons une génération de plan d'action
      
      // Simule un délai d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const daysUntilDeadline = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      // Plan d'action simulé
      const plan: GoalPlan = {
        steps: [
          {
            id: "1",
            description: `Étape 1: Définir clairement les métriques de succès pour "${goal.title}"`,
            completed: false,
            targetDate: addDays(new Date(), Math.ceil(daysUntilDeadline * 0.1))
          },
          {
            id: "2",
            description: "Étape 2: Identifier les ressources nécessaires et les obstacles potentiels",
            completed: false,
            targetDate: addDays(new Date(), Math.ceil(daysUntilDeadline * 0.2))
          },
          {
            id: "3",
            description: "Étape 3: Créer un calendrier hebdomadaire avec des actions spécifiques",
            completed: false,
            targetDate: addDays(new Date(), Math.ceil(daysUntilDeadline * 0.3))
          },
          {
            id: "4",
            description: "Étape 4: Mettre en place un système de suivi des progrès",
            completed: false,
            targetDate: addDays(new Date(), Math.ceil(daysUntilDeadline * 0.4))
          },
          {
            id: "5",
            description: "Étape 5: Évaluation à mi-parcours et ajustement du plan si nécessaire",
            completed: false,
            targetDate: addDays(new Date(), Math.ceil(daysUntilDeadline * 0.5))
          }
        ],
        tips: [
          "Fixez des moments réguliers dans la semaine pour travailler sur cet objectif",
          "Célébrez les petites victoires pour maintenir votre motivation",
          "Trouvez un partenaire de responsabilité pour vous aider à rester engagé",
          "Adaptez votre plan en fonction des réalités rencontrées"
        ],
        estimatedCompletion: `Plan estimé pour une réalisation d'ici le ${format(goal.deadline, "dd MMMM yyyy", { locale: fr })}`
      };
      
      // Mise à jour de l'objectif avec le plan généré
      setGoals(prev => prev.map(g => 
        g.id === goal.id ? { ...g, plan } : g
      ));
      
      // Mise à jour de l'objectif sélectionné avec le plan
      setSelectedGoal({ ...goal, plan });
    } catch (error) {
      console.error("Erreur lors de la génération du plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  
  const toggleStepCompletion = (goalId: string, stepId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId && goal.plan) {
        const updatedSteps = goal.plan.steps.map(step => 
          step.id === stepId ? { ...step, completed: !step.completed } : step
        );
        
        return {
          ...goal,
          plan: {
            ...goal.plan,
            steps: updatedSteps
          }
        };
      }
      return goal;
    }));
    
    // Mise à jour de l'objectif sélectionné si nécessaire
    if (selectedGoal && selectedGoal.id === goalId) {
      const updatedSteps = selectedGoal.plan?.steps.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ) || [];
      
      setSelectedGoal({
        ...selectedGoal,
        plan: selectedGoal.plan ? {
          ...selectedGoal.plan,
          steps: updatedSteps
        } : undefined
      });
    }
  };
  
  const toggleGoalCompletion = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <i className="ri-flag-line mr-2 text-primary-500"></i>
          Mes Objectifs
        </CardTitle>
        <CardDescription>
          Définissez vos objectifs de bien-être et obtenez un plan d'action personnalisé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de l'objectif</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Méditer régulièrement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date limite</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal flex justify-between"
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre objectif en détail..." 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Plus vos détails seront précis, plus le plan d'action sera pertinent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Définir l'objectif et générer un plan d'action
            </Button>
          </form>
        </Form>
        
        {goals.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-md font-medium">Objectifs en cours ({goals.length})</h3>
            
            {goals.map(goal => (
              <Card key={goal.id} className={goal.completed ? "bg-gray-50 opacity-80" : ""}>
                <CardHeader className="py-4 px-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-md font-medium flex items-center">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => toggleGoalCompletion(goal.id)}
                          className="mr-2 h-4 w-4 rounded border-gray-300"
                        />
                        <span className={goal.completed ? "line-through text-gray-500" : ""}>
                          {goal.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Échéance: {format(goal.deadline, "dd MMMM yyyy", { locale: fr })}
                      </CardDescription>
                    </div>
                    
                    <Dialog open={isDialogOpen && selectedGoal?.id === goal.id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedGoal(goal);
                            if (!goal.plan) {
                              generateGoalPlan(goal);
                            } else {
                              setIsDialogOpen(true);
                            }
                          }}
                        >
                          {goal.plan ? "Voir le plan" : "Générer un plan"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Plan d'action: {goal.title}</DialogTitle>
                          <DialogDescription>
                            Plan personnalisé pour atteindre votre objectif d'ici le {format(goal.deadline, "dd MMMM yyyy", { locale: fr })}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {isGeneratingPlan ? (
                          <div className="my-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                            <p className="mt-4 text-sm text-gray-600">Génération de votre plan d'action personnalisé...</p>
                          </div>
                        ) : (
                          selectedGoal?.plan && (
                            <div className="space-y-6 py-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <i className="ri-list-check-2 mr-2 text-primary-500"></i>
                                  Étapes à suivre
                                </h4>
                                <ul className="space-y-3">
                                  {selectedGoal.plan.steps.map(step => (
                                    <li key={step.id} className="flex items-start gap-2">
                                      <input
                                        type="checkbox"
                                        checked={step.completed}
                                        onChange={() => toggleStepCompletion(selectedGoal.id, step.id)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                      />
                                      <div>
                                        <p className={step.completed ? "line-through text-gray-500" : ""}>
                                          {step.description}
                                        </p>
                                        {step.targetDate && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Cible: {format(step.targetDate, "dd MMM yyyy", { locale: fr })}
                                          </p>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <i className="ri-lightbulb-line mr-2 text-amber-500"></i>
                                  Conseils pour réussir
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                                  {selectedGoal.plan.tips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <p className="text-sm text-center italic text-gray-600">
                                {selectedGoal.plan.estimatedCompletion}
                              </p>
                            </div>
                          )
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}