import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, MapPin, Instagram, MessageCircle, Star, Phone } from 'lucide-react';

const whatsappMessage = encodeURIComponent('Ciao, vorrei ordinare da MICHÍ.');
const whatsappUrl = `https://wa.me/393298888968?text=${whatsappMessage}`;
import { MichiLogo } from '@/components/MichiLogo';
import { Button } from '@/components/ui/button';
import { useLogos } from '@/lib/logos';

const maps = 'https://www.google.com/maps/search/?api=1&query=MICH%C3%8C+Via+Marco+Polo+102+Pescara';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'MICHÍ — Caffè & Cucina a Pescara' },
    { name: 'description', content: 'Colazioni, brunch e menu del giorno da MICHÍ, Caffè & Cucina a Pescara. Scopri il menu e vieni a trovarci in Via Marco Polo 102.' },
    { property: 'og:title', content: 'MICHÍ — Caffè & Cucina a Pescara' },
    { property: 'og:description', content: 'Colazioni, brunch e piatti genuini. Scopri il menu di MICHÍ e vieni a trovarci a Pescara.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: HomePage,
});

function HomePage() {
  const { data: logos } = useLogos();
  return <div className="min-h-screen bg-background text-foreground">
    <header className="bg-brand text-primary-foreground">
      <nav aria-label="Navigazione principale" className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 py-5">
        <Button asChild variant="ghost" className="text-primary-foreground hover:bg-brand-deep hover:text-primary-foreground"><Link to="/orari">Orari</Link></Button>
        <Button asChild variant="ghost" className="text-primary-foreground hover:bg-brand-deep hover:text-primary-foreground"><Link to="/menu">Il menu <ArrowUpRight className="size-4" /></Link></Button>
      </nav>
    </header>
    <main>
      <section className="bg-brand px-6 pb-16 pt-8 text-center text-primary-foreground md:pb-20 md:pt-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <MichiLogo variant="light" width={260} src={logos?.light ?? null} />
          <p className="mt-8 max-w-lg font-serif text-2xl leading-relaxed">Colazioni, brunch e piatti genuini.<br />Ogni giorno, a Pescara.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="bg-gold px-8 text-ink hover:bg-gold/90"><Link to="/menu">MENU DEL GIORNO</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent px-10 text-white hover:bg-white/10 hover:text-white"><Link to="/orari">ORARI</Link></Button>
          </div>
          <a href={maps} target="_blank" rel="noreferrer" className="mt-8 flex items-center gap-2 text-sm underline-offset-4 hover:underline"><MapPin className="size-4" />Via Marco Polo 102, Pescara</a>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-14 text-center md:py-20">
        <p className="text-sm text-primary">Un momento per te</p>
        <h2 className="mt-3 font-serif text-4xl">Dal primo caffè alla pausa pranzo.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
          <div><span className="font-serif text-xl text-primary">01</span><h3 className="mt-2 text-3xl">Colazione</h3><p className="mt-3 text-muted-foreground">Il piacere di iniziare la giornata, con un caffè e una pausa tutta tua.</p></div>
          <div><span className="font-serif text-xl text-primary">02</span><h3 className="mt-2 text-3xl">Brunch</h3><p className="mt-3 text-muted-foreground">Un momento da assaporare, senza fretta.</p></div>
          <div><span className="font-serif text-xl text-primary">03</span><h3 className="mt-2 text-3xl">Pranzo</h3><p className="mt-3 text-muted-foreground">Piatti genuini e un menu del giorno da scoprire ogni volta.</p></div>
        </div>
      </section>
      <section className="bg-brand px-6 py-14 text-center text-primary-foreground">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Dicono di noi</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-gold" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-6 fill-gold" />)}
        </div>
        <p className="mt-4 font-serif text-5xl">5,0</p>
        <p className="mt-2 text-base">17 recensioni su Google · €10–20 a persona</p>
        <p className="mx-auto mt-5 max-w-xl font-serif text-xl leading-relaxed">«Un posto accogliente, apprezzato per il menu del giorno, la qualità dei piatti, il personale gentile e il servizio veloce.»</p>
        <p className="mt-6 text-sm">Happy hour · Opzioni vegane · Menu bambini</p>
        <a href="https://share.google/A4zN539mZgWnu3x7c" target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm underline underline-offset-4">Leggi le recensioni su Google</a>
      </section>
      <section className="border-y border-border bg-card px-6 py-14 text-center">
        <MapPin className="mx-auto size-6 text-primary" />
        <h2 className="mt-4 font-serif text-4xl">Ci vediamo da Michí.</h2>
        <address className="mt-5 text-lg not-italic">Via Marco Polo, 102<br />65126 Pescara PE</address>
        <a href="tel:+393298888968" className="mt-3 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"><Phone className="size-4" />+39 329 888 8968</a>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild><a href={maps} target="_blank" rel="noreferrer">Come arrivare <ArrowUpRight className="size-4" /></a></Button>
          <Button asChild variant="outline"><a href="https://www.instagram.com/michi_caffe_cucina/" target="_blank" rel="noreferrer"><Instagram className="size-4" />Instagram</a></Button>
        </div>
        <a href="https://share.google/A4zN539mZgWnu3x7c" target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm text-muted-foreground underline underline-offset-4">Orari e recensioni su Google</a>
      </section>
    </main>
    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-7 text-sm text-muted-foreground"><span>MICHÍ — Caffè & Cucina · Pescara</span><Link to="/auth" className="underline-offset-4 hover:underline">Area personale</Link></footer>
    <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Ordina su WhatsApp" className="fixed bottom-6 right-6 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#128C7E] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#25D366]">
      <MessageCircle className="size-7" />
    </a>
  </div>;
}
