let expect;
const nock = require('nock');
const countries = require('../service/DefaultService'); // adjust path to your module

before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Country API Functions', () => {

  describe('countriesGET()', () => {
    it('should return a list of countries with name and flag', async () => {
      // Mock external API response
      nock('https://restcountries.com')
        .get('/v3.1/all')
        .reply(200, [
          {
            name: { common: 'France' },
            flags: { png: 'https://flagcdn.com/fr.png' }
          },
          {
            name: { common: 'Germany' },
            flags: { png: 'https://flagcdn.com/de.png' }
          }
        ]);

      const result = await countries.countriesGET();
      expect(result).to.be.an('array');
      expect(result).to.deep.include({ name: 'France', flag: 'https://flagcdn.com/fr.png' });
      expect(result).to.deep.include({ name: 'Germany', flag: 'https://flagcdn.com/de.png' });
    });
  });

  describe('countriesNameGET(name)', () => {
    it('should return details of a specific country', async () => {
      const countryName = 'France';

      // Mock external API response
      nock('https://restcountries.com')
        .get(`/v3.1/name/${countryName}`)
        .query({ fullText: true })
        .reply(200, [
          {
            name: { common: 'France' },
            flags: { svg: 'https://flagcdn.com/fr.png' },
            capital: ['Paris'],
            population: 67000000
          }
        ]);

      const result = await countries.countriesNameGET(countryName);
      expect(result).to.be.an('object');
      expect(result).to.include({
        name: 'France',
        flag: 'https://flagcdn.com/fr.png',
        capital: 'Paris',
        population: 67000000
      });
    });

    it('should handle not found country error', async () => {
      const countryName = 'Wakanda';

      // Mock 404 response
      nock('https://restcountries.com')
        .get(`/v3.1/name/${countryName}`)
        .query({ fullText: true })
        .reply(404, {
          message: "Not Found"
        });

      try {
        await countries.countriesNameGET(countryName);
      } catch (error) {
        expect(error).to.be.an('object');
        expect(error.message).to.include('Failed to fetch data for country');
      }
    });
  });
});
