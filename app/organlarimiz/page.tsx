import { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import Breadcrumb, { BreadcrumbItem } from "@/components/ui/breadcrumb";

export const metadata: Metadata = generateSEOMetadata({
  title: "Organlarımız",
  description: "GGOG Derneği yönetim organları ve üyeleri. Derneğimizin yönetim yapısı ve organları hakkında bilgi.",
  url: "/organlarimiz",
});

export default async function OrgansPage() {
  const categories = await prisma.organCategory.findMany({
    where: {
      isActive: true,
    },
    include: {
      members: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Organlarımız", href: "/organlarimiz" },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Organlarımız</h1>
            <p className="text-lg text-gray-600">
              Derneğimizin yönetim organları ve üyeleri
            </p>
          </div>
        </AnimateOnScroll>

        {categories.length === 0 ? (
          <AnimateOnScroll delay={100}>
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz organ bilgisi eklenmemiş.</p>
            </div>
          </AnimateOnScroll>
        ) : (
          <div className="space-y-12">
            {categories.map((category, categoryIndex) => (
              <AnimateOnScroll key={category.id} delay={categoryIndex * 100}>
              <div key={category.id} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary-600 mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                {category.members.length === 0 ? (
                  <p className="text-gray-500 italic">
                    Bu kategoride henüz üye bulunmamaktadır.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.members.map((member) => (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                        {/* Photo Section */}
                        <div className="relative w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                          {member.imageUrl ? (
                            <Image
                              src={member.imageUrl}
                              alt={`${member.firstName} ${member.lastName}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-6">
                              <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center mb-4 shadow-lg">
                                <span className="text-white text-2xl font-bold">
                                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                </span>
                              </div>
                              <span className="text-primary-700 font-semibold text-sm uppercase tracking-wide">
                                GGOG Member
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {member.firstName} {member.lastName}
                          </CardTitle>
                          {member.role && (
                            <CardDescription className="text-primary-600 font-medium">
                              {member.role}
                            </CardDescription>
                          )}
                        </CardHeader>
                        {member.department && (
                          <CardContent>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Bölüm:</span> {member.department}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {categories.indexOf(category) < categories.length - 1 && (
                  <Separator className="my-8" />
                )}
              </div>
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

