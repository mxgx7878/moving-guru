import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, MessageCircle, MapPin, Globe, Phone, Instagram, Loader2,
  Building2, Briefcase, Calendar, GraduationCap, Clock, ExternalLink,
  Mail, User, Languages, Plane, HeartHandshake, Users, CalendarDays,
} from 'lucide-react';

import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { Section, Button, InfoTile } from '../../components/ui';
import { ReviewList } from '../../features/reviews';

const firstValue = (...values) => values.find(
  (value) => value !== undefined && value !== null && value !== '',
);

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const asUrl = (url) => {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

function TagList({ items, className = 'bg-[#FAFEE0] text-[#3E3D38]' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span
          key={`${typeof item === 'string' ? item : index}-${index}`}
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${className}`}
        >
          {typeof item === 'string'
            ? item
            : firstValue(item?.name, item?.label, item?.title, item?.url, 'Link')}
        </span>
      ))}
    </div>
  );
}

export default function StudioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const messagesBase = user?.role === 'studio' ? '/studio/messages' : '/portal/messages';

  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance.get(`${API_ENDPOINTS.STUDIO_DETAIL}/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setStudio(data?.data?.user || data?.data || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || 'Studio not found.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#4E7A1B]" />
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-[#3E3D38] font-semibold">{error || 'Studio not found'}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="!text-sky-mg hover:!underline mt-4"
        >
          Go back
        </Button>
      </div>
    );
  }

  const detail = studio.detail || studio.studio || {};

  const studioName = firstValue(
    studio.studio_name,
    studio.studioName,
    detail.studio_name,
    detail.studioName,
    studio.name,
    'Studio',
  );
  const contactName = firstValue(
    studio.contact_name,
    studio.contactName,
    detail.contact_name,
    detail.contactName,
  );
  const bio = firstValue(studio.bio, detail.bio);
  const email = firstValue(studio.email, detail.email);
  const phone = firstValue(studio.phone, detail.phone);
  const website = firstValue(studio.website, detail.website);
  const instagram = firstValue(studio.instagram, detail.instagram);
  const profilePicture = firstValue(
    studio.profile_picture_url,
    studio.profile_picture,
    detail.profile_picture_url,
    detail.profile_picture,
  );
  const backgroundImage = firstValue(
    studio.background_image_url,
    studio.background_image,
    detail.background_image_url,
    detail.background_image,
  );

  const cityLocation = firstValue(studio.location, detail.location);
  const country = firstValue(studio.country, detail.country);
  const location = [cityLocation, country]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ');

  const studioSize = firstValue(
    studio.studio_size,
    studio.studioSize,
    detail.studio_size,
    detail.studioSize,
  );
  const profileStatus = firstValue(
    studio.profile_status,
    studio.profileStatus,
    detail.profile_status,
    detail.profileStatus,
    studio.status,
  );
  const isHiring = profileStatus === 'active';
  const initials = studioName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const disciplines = toList(firstValue(studio.disciplines, detail.disciplines));
  const openTo = toList(firstValue(
    studio.open_to,
    studio.openTo,
    detail.open_to,
    detail.openTo,
  ));
  const amenities = toList(firstValue(studio.amenities, detail.amenities));
  const languages = toList(firstValue(studio.languages, detail.languages));
  const lookingFor = toList(firstValue(
    studio.looking_for,
    studio.lookingFor,
    detail.looking_for,
    detail.lookingFor,
  ));
  const travellingTo = toList(firstValue(
    studio.traveling_to,
    studio.travelingTo,
    detail.traveling_to,
    detail.travelingTo,
  ));
  const socialLinks = toList(firstValue(studio.social_links, detail.social_links));
  console.log(socialLinks)
  const gallery = toList(firstValue(
    studio.gallery_photos_urls,
    detail.gallery_photos_urls,
    studio.gallery_photos,
    detail.gallery_photos,
  ));

  const availability = firstValue(studio.availability, detail.availability);
  const availableFrom = firstValue(
    studio.available_from,
    studio.availableFrom,
    detail.available_from,
    detail.availableFrom,
  );
  const availableTo = firstValue(
    studio.available_to,
    studio.availableTo,
    detail.available_to,
    detail.availableTo,
  );
  const flexibleDates = firstValue(
    studio.flexible_dates,
    studio.flexibleDates,
    detail.flexible_dates,
    detail.flexibleDates,
  );
  const pronouns = firstValue(studio.pronouns, detail.pronouns);
  const countryFrom = firstValue(
    studio.country_from,
    studio.countryFrom,
    detail.country_from,
    detail.countryFrom,
  );

  const hiringRoleDesc = firstValue(
    studio.hiring_role_description,
    detail.hiring_role_description,
  );
  const hiringStart = firstValue(studio.hiring_start_date, detail.hiring_start_date);
  const hiringComp = firstValue(studio.hiring_compensation, detail.hiring_compensation);
  const hiringDuration = firstValue(studio.hiring_duration, detail.hiring_duration);
  const hiringPositionType = firstValue(
    studio.hiring_position_type,
    detail.hiring_position_type,
  );
  const hiringQualification = firstValue(
    studio.hiring_qualification_level,
    detail.hiring_qualification_level,
  );

  const showAvailability = availability || availableFrom || availableTo || flexibleDates;
  const showBackgroundDetails = pronouns || countryFrom || languages.length > 0;
  const showOpportunityDetails = lookingFor.length > 0 || travellingTo.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
          className="!text-ink-muted hover:!text-ink !bg-transparent !border-transparent"
        >
          Back
        </Button>

        {studio.id !== user?.id && (
          <Button
            variant="primary"
            icon={MessageCircle}
            onClick={() => navigate(messagesBase, {
              state: {
                recipientId: studio.id,
                recipientName: studioName,
                recipientAvatar: profilePicture,
              },
            })}
          >
            Chat
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div
          className="h-40 bg-cover bg-center"
          style={backgroundImage
            ? { backgroundImage: `url("${backgroundImage}")` }
            : { background: 'linear-gradient(135deg, #4E7A1B 0%, #B4FF5A 60%, #F5FDA6 100%)' }}
        />

        <div className="px-6 pb-6 relative">
          <div className="flex items-center gap-4  mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#4E7A1B] to-[#3F6216] flex items-center justify-center flex-shrink-0">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={studioName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-unbounded text-xl font-black text-white">
                  {initials}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <h1 className="font-unbounded text-xl font-black text-[#3E3D38] truncate">
                {studioName}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#9A9A94] flex-wrap">
                {contactName && <span>Managed by {contactName}</span>}
                {studioSize && <span>· {studioSize}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold ${
                  isHiring
                    ? 'bg-[#B4FF5A]/20 text-[#3E3D38]'
                    : 'bg-[#FAFEE0] text-[#6B6B66]'
                }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isHiring ? 'bg-[#4E7A1B]' : 'bg-[#9A9A94]'
                  }`}
                  />
                  {isHiring ? 'Active Studio' : 'Inactive Studio'}
                </span>

                {instagram && (
                  <a
                    href={asUrl(
                      instagram.startsWith('@')
                        ? `instagram.com/${instagram.replace('@', '')}`
                        : instagram,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#1A1A1A]/20"
                  >
                    <Instagram size={10} /> Instagram
                  </a>
                )}

                {website && (
                  <a
                    href={asUrl(website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#4E7A1B]/10 text-[#4E7A1B] hover:bg-[#4E7A1B]/20"
                  >
                    <Globe size={10} /> Website <ExternalLink size={8} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {location && <InfoTile icon={<MapPin size={12} />} label="Location" value={location} />}
            {phone && <InfoTile icon={<Phone size={12} />} label="Phone" value={phone} />}
            {email && <InfoTile icon={<Mail size={12} />} label="Email" value={email} />}
            {studioSize && (
              <InfoTile icon={<Building2 size={12} />} label="Studio Size" value={studioSize} />
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {bio && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                About the Studio
              </h3>
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </Section>
          )}

          {(hiringRoleDesc || hiringStart || hiringDuration || hiringComp || hiringPositionType) && (
            <Section>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-[#3E3D38]" />
                <h3 className="font-unbounded text-sm font-black text-[#3E3D38]">
                  Hiring Details
                </h3>
              </div>
              {hiringRoleDesc && (
                <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">
                  {hiringRoleDesc}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#E5E0D8]">
                {hiringStart && (
                  <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                    <Calendar size={11} /> Starts {formatDate(hiringStart)}
                  </span>
                )}
                {hiringDuration && (
                  <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                    <Clock size={11} /> {hiringDuration}
                  </span>
                )}
                {hiringPositionType && (
                  <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                    <Users size={11} /> {hiringPositionType}
                  </span>
                )}
                {hiringComp && (
                  <span className="text-xs text-[#3E3D38] font-semibold">{hiringComp}</span>
                )}
              </div>
            </Section>
          )}

          {disciplines.length > 0 && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Disciplines Offered
              </h3>
              <TagList items={disciplines} className="bg-[#4E7A1B]/10 text-[#4E7A1B]" />
            </Section>
          )}

          {showAvailability && (
            <Section>
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={14} className="text-[#3E3D38]" />
                <h3 className="font-unbounded text-sm font-black text-[#3E3D38]">
                  Availability
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {availability && (
                  <InfoTile icon={<Clock size={12} />} label="Availability" value={availability} />
                )}
                {availableFrom && (
                  <InfoTile
                    icon={<Calendar size={12} />}
                    label="Available From"
                    value={formatDate(availableFrom)}
                  />
                )}
                {availableTo && (
                  <InfoTile
                    icon={<Calendar size={12} />}
                    label="Available To"
                    value={formatDate(availableTo)}
                  />
                )}
                {flexibleDates && (
                  <InfoTile icon={<CalendarDays size={12} />} label="Dates" value="Flexible dates" />
                )}
              </div>
            </Section>
          )}

          {gallery.length > 0 && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Gallery
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {gallery.map((photo, index) => {
                  const photoUrl = typeof photo === 'string'
                    ? photo
                    : firstValue(photo?.url, photo?.path, photo?.image_url);
                  if (!photoUrl) return null;
                  return (
                    <div
                      key={`${photoUrl}-${index}`}
                      className="aspect-square rounded-xl overflow-hidden bg-[#FAFEE0]"
                    >
                      <img
                        src={photoUrl}
                        alt={`${studioName} gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section>
            <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
              Reviews from Instructors
            </h3>
            <ReviewList
              userId={studio.id}
              direction="instructor_to_studio"
              emptyLabel="No reviews yet — no instructor has reviewed this studio on Moving Guru."
            />
          </Section>
        </div>

        <div className="space-y-6">
          {openTo.length > 0 && (
            <Section>
              <div className="flex items-center gap-2 mb-4">
                <HeartHandshake size={14} className="text-[#3E3D38]" />
                <h3 className="font-unbounded text-sm font-black text-[#3E3D38]">Open To</h3>
              </div>
              <TagList items={openTo} />
            </Section>
          )}

          {amenities.length > 0 && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Amenities
              </h3>
              <TagList items={amenities} className="bg-[#FAFEE0] text-[#6B6B66]" />
            </Section>
          )}

          {showBackgroundDetails && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Studio Details
              </h3>
              <div className="space-y-3">
                {contactName && (
                  <InfoTile icon={<User size={12} />} label="Contact Person" value={contactName} />
                )}
                {pronouns && (
                  <InfoTile icon={<User size={12} />} label="Pronouns" value={pronouns} />
                )}
                {countryFrom && (
                  <InfoTile icon={<Globe size={12} />} label="From" value={countryFrom} />
                )}
                {languages.length > 0 && (
                  <InfoTile
                    icon={<Languages size={12} />}
                    label="Languages"
                    value={languages.join(', ')}
                  />
                )}
              </div>
            </Section>
          )}

          {showOpportunityDetails && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Opportunities
              </h3>
              <div className="space-y-4">
                {lookingFor.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[#9A9A94] mb-2">
                      Looking For
                    </p>
                    <TagList items={lookingFor} />
                  </div>
                )}
                {travellingTo.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#9A9A94] mb-2">
                      <Plane size={10} /> Travelling To
                    </p>
                    <TagList items={travellingTo} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {hiringQualification && hiringQualification !== 'none' && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Minimum Qualification
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#F5FDA6] text-[#3E3D38]">
                <GraduationCap size={11} /> {hiringQualification}
              </span>
            </Section>
          )}

          {socialLinks.length > 0 && (
            <Section>
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] mb-4">
                Social Links
              </h3>
              <div className="space-y-2">
                {socialLinks.map((link, index) => {
                  const dynamicEntry = typeof link === 'object' && link
                    ? Object.entries(link).find(([key, value]) =>
                        !['url', 'link', 'platform', 'name'].includes(key) &&
                        typeof value === 'string' &&
                        value.trim()
                      )
                    : null;

                  const dynamicPlatform = dynamicEntry?.[0];
                  const dynamicUrl = dynamicEntry?.[1];

                  const url = typeof link === 'string'
                    ? link
                    : firstValue(link?.url, link?.link, dynamicUrl);

                  if (!url) return null;

                  const label = typeof link === 'string'
                    ? `Social link ${index + 1}`
                    : firstValue(
                        link?.platform,
                        link?.name,
                        dynamicPlatform
                          ? dynamicPlatform.charAt(0).toUpperCase() + dynamicPlatform.slice(1)
                          : null,
                        `Social link ${index + 1}`,
                      );

                  return (
                    <a
                      key={`${url}-${index}`}
                      href={asUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-xs font-semibold text-[#4E7A1B] hover:underline"
                    >
                      <span>{label}</span>
                      <ExternalLink size={11} />
                    </a>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}