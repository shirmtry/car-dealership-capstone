import React from 'react';

const team = [
  { name: 'Daniel Hayes', photo: 'daniel', role: 'General Manager', email: 'daniel.hayes',
    bio: 'Daniel brings 18 years of automotive retail experience to our network. He helps partner dealerships improve service and keeps our customers at the center of every decision.' },
  { name: 'Marcus Reed', photo: 'marcus', role: 'Sales Director', email: 'marcus.reed',
    bio: 'Marcus works with our dealer partners to make buying a car more transparent. He helps customers compare vehicle choices and supports clear, honest conversations throughout the purchase.' },
  { name: 'Elena Brooks', photo: 'elena', role: 'Customer Relations Lead', email: 'elena.brooks',
    bio: 'Elena leads customer support and listens closely to buyer feedback. She helps resolve questions, encourages useful reviews, and makes sure every customer has a voice in our community.' }
];

export function About() {
  return <main className="page"><p className="eyebrow">Our people</p><h1>About Us</h1>
    <p className="lead-copy">A better car journey starts with a dealer you can trust. OpenRoad connects buyers with dealerships across the United States, making customer experiences easier to compare and share.</p>
    <div className="team-grid">{team.map((person) => <article className="profile-card" key={person.name}>
      <img className="team-photo" src={'/static/team/' + person.photo + '.png'} alt={'Synthetic portrait for fictional team member ' + person.name} />
      <div className="profile-body"><h2>{person.name}</h2><p className="role">{person.role}</p><p>{person.bio}</p>
        <a href={'mailto:' + person.email + '@openroad.example'}>{person.email}@openroad.example</a></div>
    </article>)}</div>
    <p className="form-hint">Team names are fictional and portraits are synthetic.</p>
  </main>;
}

export function Contact() {
  return <main className="page"><p className="eyebrow">Let's talk</p><h1>Contact Us</h1>
    <p className="lead-copy">Need help finding a dealership, sharing a review or choosing your next car? Our team is ready to help.</p>
    <div className="contact-grid"><img className="contact-image" src="/static/contactus.png" alt="Contact the OpenRoad customer service team" />
      <section className="contact-details"><h2>Get in touch</h2><dl>
        <dt>Address</dt><dd>1200 Harbor Drive, Suite 400<br />Jersey City, NJ 07302, United States</dd>
        <dt>Phone</dt><dd><a href="tel:+12015550148">+1 (201) 555-0148</a></dd>
        <dt>Support</dt><dd><a href="mailto:support@openroad.example">support@openroad.example</a></dd>
        <dt>Sales</dt><dd><a href="mailto:sales@openroad.example">sales@openroad.example</a></dd>
        <dt>Hours</dt><dd>Monday - Saturday<br />9:00 AM - 7:00 PM Eastern Time<br />Closed on Sunday</dd>
      </dl><a className="button" href="/dealers">Explore Dealerships</a></section>
    </div>
  </main>;
}
