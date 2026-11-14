import { Container, PageHeader } from "@/components/ui/kit";
import { BlogIndex } from "@/components/blog/blog-index";
import { Reveal } from "@/components/animations/reveal";
import { getArticles } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tech Blog",
  description:
    "Veille technologique et retours de lab : networking, Linux & systems, automation, DevOps, DevSecOps, cybersécurité, IA et cloud.",
  path: "/blog",
});

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      <PageHeader
        kicker="06 // TECH BLOG"
        title="Veille technologique"
        description="Retours de lab, procédures documentées et notes techniques. Temps de lecture calculé, contenu versionné."
      />

      <Container className="py-14">
        <Reveal>
          <BlogIndex articles={articles} />
        </Reveal>
      </Container>
    </>
  );
}
