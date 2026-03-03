import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "../components/SEOHead";
import { useGetSkills } from "../hooks/useQueries";

const categoryLabels: Record<string, string> = {
  primary: "Primary Skills",
  secondary: "Secondary Skills",
  security: "Security",
  additional: "Additional Skills",
};

const categoryOrder = ["primary", "secondary", "security", "additional"];

export default function Skills() {
  const { data: skills, isLoading } = useGetSkills();

  const skillsByCategory =
    skills?.reduce(
      (acc, skill) => {
        const cat = skill.category as string;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
      },
      {} as Record<string, typeof skills>,
    ) ?? {};

  const sortedCategories = Object.keys(skillsByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );

  return (
    <>
      <SEOHead
        page="skills"
        defaultTitle="Skills - Portfolio"
        defaultDescription="Technical skills and expertise across various technologies."
      />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-3xl">
          <Badge variant="secondary">Expertise</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Skills & Technologies
          </h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive overview of my technical skills and proficiency
            levels.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["sk-1", "sk-2", "sk-3", "sk-4"].map((key) => (
                <Card key={key}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["sk-a", "sk-b", "sk-c", "sk-d"].map((innerKey) => (
                      <div key={innerKey} className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedCategories.map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {categoryLabels[category] ?? category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skillsByCategory[category]?.map((skill) => (
                      <div key={skill.id.toString()} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {skill.name}
                          </span>
                          <span className="text-muted-foreground">
                            {Number(skill.experience)}y exp
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (Number(skill.experience) / 10) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No skills added yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
