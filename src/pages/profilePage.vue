<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md border-bottom q-pb-sm">
      <div class="col-12 flex justify-between items-center">
        <div>
          <h1 class="text-h5 text-weight-bold q-my-none">Profile Data</h1>
          <p class="text-body2 text-grey q-mt-xs">
            Manage the details used for autofilling and resume generation.
          </p>
        </div>
        <q-btn
          unelevated
          color="primary"
          no-caps
          icon="save"
          label="Save Profile"
          @click="onSubmit"
        />
      </div>
    </div>

    <!-- Top Navigation Toolbar -->
    <q-card bordered flat class="border-outline q-mb-md">
      <q-tabs
        v-model="activeTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab
          name="personal"
          icon="person_outline"
          label="Personal Info"
          no-caps
        />
        <q-tab name="summary" icon="short_text" label="Summary" no-caps />
        <q-tab
          name="experience"
          icon="work_outline"
          label="Experience"
          no-caps
        />
        <q-tab name="education" icon="school" label="Education" no-caps />
        <q-tab name="skills" icon="code" label="Skills" no-caps />
        <q-tab name="projects" icon="rocket_launch" label="Projects" no-caps />
        <q-tab
          name="references"
          icon="verified_user"
          label="References"
          no-caps
        />
      </q-tabs>
    </q-card>

    <div class="row">
      <div class="col-12">
        <q-form class="q-gutter-y-md">
          <!-- Personal Info Section -->
          <div v-show="activeTab === 'personal'" class="transition-fade">
            <q-card bordered flat class="border-outline form-card q-pa-md">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profile.firstName"
                    label="First Name"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profile.lastName"
                    label="Last Name"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profile.email"
                    type="email"
                    label="Email Address"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profile.phone"
                    type="tel"
                    label="Phone Number"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="profile.location"
                    label="Location (City, Country)"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 q-mt-md">
                  <div class="row justify-between items-center q-mb-sm">
                    <div class="text-subtitle2 text-weight-medium">
                      Social & Portfolios
                    </div>
                    <q-btn
                      outline
                      no-caps
                      color="primary"
                      icon="add"
                      label="Add Link"
                      size="sm"
                      @click="addLink"
                    />
                  </div>

                  <div
                    class="row q-col-gutter-sm q-mb-sm"
                    v-for="(link, index) in profile.links"
                    :key="index"
                  >
                    <div class="col-12 col-sm-4">
                      <q-input
                        v-model="link.name"
                        label="Platform (e.g. GitHub)"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-10 col-sm-7">
                      <q-input v-model="link.url" label="URL" outlined dense>
                        <template v-slot:prepend
                          ><q-icon name="link" size="xs"
                        /></template>
                      </q-input>
                    </div>
                    <div class="col-2 col-sm-1 flex flex-center">
                      <q-btn
                        icon="close"
                        flat
                        round
                        dense
                        class="text-grey hover-red"
                        @click="removeLink(index)"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card>
          </div>

          <!-- Summary Section -->
          <div v-show="activeTab === 'summary'" class="transition-fade">
            <q-card bordered flat class="border-outline form-card q-pa-md">
              <p class="text-body2 text-grey q-mb-sm">
                A brief overview of your professional background.
              </p>
              <q-input
                v-model="profile.summary"
                type="textarea"
                outlined
                placeholder="A brief overview of your professional background..."
                rows="5"
                dense
              />
            </q-card>
          </div>

          <!-- Experience Section -->
          <div v-show="activeTab === 'experience'" class="transition-fade">
            <div class="row justify-end q-mb-sm">
              <q-btn
                outline
                no-caps
                color="primary"
                icon="add"
                label="Add Role"
                size="sm"
                @click="addExperience"
              />
            </div>

            <div
              v-if="profile.experience.length === 0"
              class="border-outline q-pa-lg text-center text-grey rounded-borders"
            >
              <q-icon
                name="work_outline"
                size="lg"
                class="q-mb-sm opacity-50"
              />
              <div class="text-body2">No experience details added.</div>
            </div>

            <q-list class="q-gutter-y-sm">
              <q-card
                v-for="(exp, index) in profile.experience"
                :key="index"
                bordered
                flat
                class="border-outline relative-position form-card q-pa-md"
              >
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  class="absolute-top-right text-grey hover-red q-ma-xs"
                  @click="removeExperience(index)"
                  style="z-index: 10"
                  size="sm"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="exp.jobTitle"
                      label="Job Title"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="exp.company"
                      label="Company"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="row q-gutter-x-sm">
                      <q-input
                        v-model="exp.startDate"
                        label="Start"
                        outlined
                        dense
                        class="col"
                        type="date"
                      />
                      <q-input
                        v-model="exp.endDate"
                        label="End"
                        outlined
                        dense
                        class="col"
                        type="date"
                        :disable="exp.current"
                      />
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 flex items-center">
                    <q-checkbox
                      v-model="exp.current"
                      label="I currently work here"
                      color="primary"
                      dense
                      size="sm"
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="exp.description"
                      type="textarea"
                      label="Description / Achievements"
                      outlined
                      dense
                      rows="3"
                    />
                  </div>
                </div>
              </q-card>
            </q-list>
          </div>

          <!-- Education Section -->
          <div v-show="activeTab === 'education'" class="transition-fade">
            <div class="row justify-end q-mb-sm">
              <q-btn
                outline
                no-caps
                color="primary"
                icon="add"
                label="Add School"
                size="sm"
                @click="addEducation"
              />
            </div>

            <div
              v-if="profile.education.length === 0"
              class="border-outline q-pa-lg text-center text-grey rounded-borders"
            >
              <q-icon name="school" size="lg" class="q-mb-sm opacity-50" />
              <div class="text-body2">No educational details added.</div>
            </div>

            <q-list class="q-gutter-y-sm">
              <q-card
                v-for="(edu, index) in profile.education"
                :key="index"
                bordered
                flat
                class="border-outline relative-position form-card q-pa-md"
              >
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  class="absolute-top-right text-grey hover-red q-ma-xs"
                  @click="removeEducation(index)"
                  style="z-index: 10"
                  size="sm"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="edu.school"
                      label="School / University"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="edu.degree"
                      label="Degree"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="edu.field"
                      label="Field of Study"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="row q-gutter-x-sm">
                      <q-input
                        v-model="edu.startDate"
                        label="Start"
                        outlined
                        dense
                        class="col"
                        type="date"
                      />
                      <q-input
                        v-model="edu.endDate"
                        label="Expected End"
                        outlined
                        dense
                        class="col"
                        type="date"
                      />
                    </div>
                  </div>
                </div>
              </q-card>
            </q-list>
          </div>

          <!-- Projects Section -->
          <div v-show="activeTab === 'projects'" class="transition-fade">
            <div class="row justify-end q-mb-sm">
              <q-btn
                outline
                no-caps
                color="primary"
                icon="add"
                label="Add Project"
                size="sm"
                @click="addProject"
              />
            </div>

            <div
              v-if="profile.projects.length === 0"
              class="border-outline q-pa-lg text-center text-grey rounded-borders"
            >
              <q-icon
                name="rocket_launch"
                size="lg"
                class="q-mb-sm opacity-50"
              />
              <div class="text-body2">No projects added.</div>
            </div>

            <q-list class="q-gutter-y-sm">
              <q-card
                v-for="(proj, index) in profile.projects"
                :key="index"
                bordered
                flat
                class="border-outline relative-position form-card q-pa-md"
              >
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  class="absolute-top-right text-grey hover-red q-ma-xs"
                  @click="removeProject(index)"
                  style="z-index: 10"
                  size="sm"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="proj.title"
                      label="Project Title"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="proj.url"
                      label="Project URL"
                      outlined
                      dense
                    >
                      <template v-slot:prepend
                        ><q-icon name="link" size="xs"
                      /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="proj.role"
                      label="Your Role"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="row q-gutter-x-sm">
                      <q-input
                        v-model="proj.startDate"
                        label="Start"
                        outlined
                        dense
                        class="col"
                        type="date"
                      />
                      <q-input
                        v-model="proj.endDate"
                        label="End"
                        outlined
                        dense
                        class="col"
                        type="date"
                      />
                    </div>
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="proj.description"
                      type="textarea"
                      label="Description / Technologies used"
                      outlined
                      dense
                      rows="3"
                    />
                  </div>
                </div>
              </q-card>
            </q-list>
          </div>

          <!-- References Section -->
          <div v-show="activeTab === 'references'" class="transition-fade">
            <div class="row justify-end q-mb-sm">
              <q-btn
                outline
                no-caps
                color="primary"
                icon="add"
                label="Add Reference"
                size="sm"
                @click="addReference"
              />
            </div>

            <div
              v-if="profile.references.length === 0"
              class="border-outline q-pa-lg text-center text-grey rounded-borders"
            >
              <q-icon
                name="verified_user"
                size="lg"
                class="q-mb-sm opacity-50"
              />
              <div class="text-body2">No references added.</div>
            </div>

            <q-list class="q-gutter-y-sm">
              <q-card
                v-for="(ref, index) in profile.references"
                :key="index"
                bordered
                flat
                class="border-outline relative-position form-card q-pa-md"
              >
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  class="absolute-top-right text-grey hover-red q-ma-xs"
                  @click="removeReference(index)"
                  style="z-index: 10"
                  size="sm"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="ref.name"
                      label="Reference Name"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="ref.company"
                      label="Company / Organization"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="ref.email"
                      type="email"
                      label="Email Address"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="ref.phone"
                      type="tel"
                      label="Phone Number"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </q-card>
            </q-list>
          </div>

          <!-- Skills Section -->
          <div v-show="activeTab === 'skills'" class="transition-fade">
            <div class="row justify-end q-mb-sm">
              <q-btn
                outline
                no-caps
                color="primary"
                icon="add"
                label="Add Category"
                size="sm"
                @click="addSkillCategory"
              />
            </div>

            <div
              v-if="profile.skills.length === 0"
              class="border-outline q-pa-lg text-center text-grey rounded-borders"
            >
              <q-icon
                name="code"
                size="lg"
                class="q-mb-sm opacity-50"
              />
              <div class="text-body2">No skill categories added.</div>
            </div>

            <q-list class="q-gutter-y-sm">
              <q-card
                v-for="(cat, index) in profile.skills"
                :key="index"
                bordered
                flat
                class="border-outline relative-position form-card q-pa-md"
              >
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  class="absolute-top-right text-grey hover-red q-ma-xs"
                  @click="removeSkillCategory(index)"
                  style="z-index: 10"
                  size="sm"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-model="cat.category"
                      label="Category Name (e.g. Frontend)"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-sm-8">
                    <q-select
                      label="Skills (Press enter to add)"
                      outlined
                      dense
                      v-model="cat.skills"
                      use-input
                      use-chips
                      multiple
                      hide-dropdown-icon
                      input-debounce="0"
                      new-value-mode="add-unique"
                    >
                      <template v-slot:selected-item="scope">
                        <q-chip
                          removable
                          dense
                          outline
                          @remove="scope.removeAtIndex(scope.index)"
                          :tabindex="scope.tabindex"
                          color="primary"
                          class="q-ma-xs"
                          size="sm"
                        >
                          {{ scope.opt }}
                        </q-chip>
                      </template>
                    </q-select>
                  </div>
                </div>
              </q-card>
            </q-list>
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { getProfile, saveProfile, type UserProfile, type SkillCategory } from "src/db";
import { toRaw } from "vue";

const $q = useQuasar();
const activeTab = ref("personal");

const profile = ref<UserProfile>({
  id: "current",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  links: [
    { name: "LinkedIn", url: "" },
    { name: "GitHub", url: "" },
  ],
  summary: "",
  experience: [
    {
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  education: [
    { school: "", degree: "", field: "", startDate: "", endDate: "" },
  ],
  skills: [] as SkillCategory[],
  projects: [
    {
      title: "",
      url: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  references: [{ name: "", company: "", email: "", phone: "" }],
});

const addExperience = () => {
  profile.value.experience.push({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });
};

const removeExperience = (index: number) => {
  profile.value.experience.splice(index, 1);
};

const addLink = () => {
  profile.value.links.push({ name: "", url: "" });
};

const removeLink = (index: number) => {
  profile.value.links.splice(index, 1);
};

const addEducation = () => {
  profile.value.education.push({
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
  });
};

const removeEducation = (index: number) => {
  profile.value.education.splice(index, 1);
};

const addProject = () => {
  profile.value.projects.push({
    title: "",
    url: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  });
};

const removeProject = (index: number) => {
  profile.value.projects.splice(index, 1);
};

const addReference = () => {
  profile.value.references.push({
    name: "",
    company: "",
    email: "",
    phone: "",
  });
};

const removeReference = (index: number) => {
  profile.value.references.splice(index, 1);
};

const addSkillCategory = () => {
  profile.value.skills.push({ category: "", skills: [] });
};

const removeSkillCategory = (index: number) => {
  profile.value.skills.splice(index, 1);
};

onMounted(async () => {
  const savedProfile = await getProfile();
  if (savedProfile) {
    profile.value = { ...profile.value, ...savedProfile };
  }
});

const onSubmit = async () => {
  try {
    await saveProfile(toRaw(profile.value));
    $q.notify({
      type: "positive",
      message: "Profile saved successfully",
      position: "bottom-right",
      timeout: 2000,
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    $q.notify({
      type: "negative",
      message: "Failed to save profile",
      position: "bottom-right",
    });
  }
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--q-dark);
}

.hover-red:hover {
  color: var(--q-negative) !important;
}

.opacity-50 {
  opacity: 0.5;
}

.transition-fade {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
