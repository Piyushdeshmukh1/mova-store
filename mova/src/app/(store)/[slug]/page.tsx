import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getFaqs, getPage, getSettings } from "@/lib/cms";
import { markdownToHtml } from "@/lib/markdown";
import { buildMetadata, breadcrumbSchema, JsonLd } from "@/lib/seo";
import { PageHero } from "@/components/store/PageHero";
import { SmartImage } from "@/components/store/SmartImage";
import { SocialIcons } from "@/components/store/SocialIcons";
import { ContactForm } from "@/components/store/ContactForm";
import { Reveal } from "@/components/store/Reveal";

type P = { params: { slug: string } };

const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());

export async function generateMetadata({ params }: P) {
  const page = await getPage(params.slug).catch(() => null);
  if (!page) return {};
  return buildMetadata({ title: page.seoTitle || titleCase(page.title), description: page.seoDescription || page.subtitle, image: page.ogImage || page.heroImage, path: `/${page.slug}` });
}

export default async function CmsPage({ params }: P) {
  const page = await getPage(params.slug).catch(() => null);
  if (!page) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: titleCase(page.title), path: `/${page.slug}` }];
  const html = markdownToHtml(page.content || "");

  let body: React.ReactNode;
  if (page.template === "contact") {
    const { site, social } = await getSettings();
    const wa = site.whatsapp.replace(/\D/g, "");
    body = (
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          {html && <div className="prose-mova" dangerouslySetInnerHTML={{ __html: html }} />}
          <ul className="grid gap-3">
            {site.email && <Info icon={<Mail className="h-5 w-5" />} label="Email" value={<a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>} />}
            {site.phone && <Info icon={<Phone className="h-5 w-5" />} label="Phone" value={<a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:underline">{site.phone}</a>} />}
            {wa && <Info icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={<a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Chat with us</a>} />}
            {site.businessHours && <Info icon={<Clock className="h-5 w-5" />} label="Hours" value={site.businessHours} />}
            {site.address && <Info icon={<MapPin className="h-5 w-5" />} label="Address" value={<span className="whitespace-pre-line">{site.address}</span>} />}
          </ul>
          <SocialIcons social={social} />
        </div>
        <ContactForm />
      </div>
    );
  } else if (page.template === "faq") {
    const faqs: Awaited<ReturnType<typeof getFaqs>> = await getFaqs().catch(() => []);
    const groups = faqs.reduce<Record<string, typeof faqs>>((g, f) => ((g[f.category] ||= []).push(f), g), {});
    const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) };
    body = (
      <div className="max-w-3xl">
        {html && <div className="prose-mova mb-10" dangerouslySetInnerHTML={{ __html: html }} />}
        {Object.entries(groups).map(([cat, list]) => (
          <div key={cat} className="mb-12">
            <h2 className="mb-4 text-xl uppercase">{cat}</h2>
            <div className="divide-y divide-forest/10 rounded-[2rem] bg-white px-6 md:px-8">
              {list.map((f) => (
                <details key={f.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[17px] font-bold text-forest">
                    {f.question}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint-200 text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-charcoal/75">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
        <JsonLd data={schema} />
      </div>
    );
  } else if (page.template === "about") {
    body = (
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal className="fold aspect-[4/5] overflow-hidden bg-mint-200"><SmartImage src={page.heroImage} alt="" className="h-full w-full" /></Reveal>
        </div>
        <div>
          <div className="prose-mova" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/collection" className="btn-primary">Explore the collection</Link>
            <Link href="/hello-there" className="btn-ghost">Say hello</Link>
          </div>
        </div>
      </div>
    );
  } else {
    body = <div className="prose-mova mx-auto lg:mx-0" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} image={page.template === "about" ? null : page.heroImage} crumbs={crumbs} />
      <section className="container pb-24">{body}</section>
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4 rounded-3xl bg-white p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint-200 text-forest">{icon}</span>
      <span><span className="block text-xs font-semibold uppercase tracking-wide text-sage">{label}</span><span className="text-forest">{value}</span></span>
    </li>
  );
}
