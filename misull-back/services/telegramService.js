// services/telegramService.js
// Envoie des notifications Telegram à chaque événement important.

// Formate une date en français lisible
// Ex : "vendredi 25 avril 2026 à 15h30"
const formaterDate = (date) => {
  if (!date) return 'Non précisée';
  return new Date(date).toLocaleString('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Brussels'
  });
};

const envoyerNotification = async (commande, pseudo) => {
  try {
    // On construit le détail de chaque ligne de commande
    // avec les suppléments s'il y en a
    const detailLignes = commande.lignes.map(ligne => {
      // On liste les noms des suppléments choisis
      const supplements = ligne.supplements.length > 0
        ? `\n     Garnitures : ${ligne.supplements.map(s => s.nom).join(', ')}`
        : '';

      return `- ${ligne.tiramisu.nom} (${ligne.gout.nom}) - ${ligne.taille.nom} x${ligne.quantite}${supplements}`;
    }).join('\n');

    const message = `
🍰 Nouvelle commande !

👤 Client : ${pseudo}
📦 Commande #${commande.id_commande}
💰 Total : ${commande.prixTotal} €
📅 Retrait souhaité : ${formaterDate(commande.dateRetrait)}
🚗 Livraison samedi : ${commande.livraisonSamedi ? 'Oui (+2,50 €)' : 'Non'}

🛒 Détail :
${detailLignes}

⚡ Statut : En attente
    `.trim();

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;

    const reponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
      })
    });

    const data = await reponse.json();

    if (!data.ok) {
      console.error('Erreur Telegram :', data);
    } else {
      console.log('Notification Telegram envoyée !');
    }

  } catch (error) {
    // On ne fait pas crasher le serveur si Telegram est indisponible
    console.error('Erreur envoi Telegram :', error);
  }
};

const envoyerAnnulation = async (id_commande) => {
  try {
    const message = `❌ Commande #${id_commande} annulée par le client.`;

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
      })
    });
  } catch (error) {
    console.error('Erreur notif annulation Telegram :', error);
  }
};

module.exports = { envoyerNotification, envoyerAnnulation };