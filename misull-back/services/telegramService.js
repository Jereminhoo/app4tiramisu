// services/telegramService.js
// Ce service envoie des notifications sur Telegram
// à chaque fois qu'une commande est passée.

const envoyerNotification = async (commande, pseudo) => {
  try {
    // On construit le message qui sera envoyé sur Telegram
    const message = `
🍰 Nouvelle commande !

👤 Client : ${pseudo}
📦 Commande #${commande.id_commande}
💰 Total : ${commande.prixTotal}€

🛒 Détail :
${commande.lignes.map(ligne => 
  `• ${ligne.tiramisu.nom} - ${ligne.taille.nom} - ${ligne.gout.nom} x${ligne.quantite}`
).join('\n')}

⚡ Statut : En attente
    `.trim();

    // On appelle l'API Telegram avec fetch
    // C'est une requête HTTP vers les serveurs de Telegram
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
    // La commande est déjà enregistrée — la notif est juste un bonus
    console.error('Erreur envoi Telegram :', error);
  }
};

// Notifie l'admin qu'une commande a été annulée
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